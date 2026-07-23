import "reflect-metadata";
import * as path from "path";
import express from "express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const next = require("next");
import { AppModule } from "./app.module";

/**
 * Single combined entry point for shared hosting: one process, one port.
 * NestJS gets its own internal Express instance, which is mounted as a
 * sub-app under /api on a parent Express server; everything else on the
 * parent falls through to Next.js's request handler. This exists so
 * Hostinger's "Setup Node.js App" (Phusion Passenger — one Node process per
 * app) only needs ONE application instead of two.
 *
 * Sharing a single Express instance between Nest and Next (mounting Next's
 * handler as post-init middleware on Nest's own app) does NOT work: Nest
 * installs its own catch-all 404 handling during init and terminates
 * unmatched requests before they'd ever reach a fallback middleware. Mounting
 * Nest as an isolated sub-app avoids that entirely — Nest's 404 handling
 * only ever sees requests already scoped to /api.
 */
async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule, { cors: true });
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );
  // No setGlobalPrefix('api') here — the parent server's `use('/api', ...)`
  // mount below supplies that prefix instead.
  await nestApp.init();
  const nestHandler = nestApp.getHttpAdapter().getInstance();

  const nextApp = next({ dev: false, dir: path.join(__dirname, "..", "web") });
  const nextHandle = nextApp.getRequestHandler();
  await nextApp.prepare();

  const server = express();
  server.use("/api", nestHandler);
  server.all("*", (req, res) => nextHandle(req, res));

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`savhnos listening on port ${port} — API at /api, web app everywhere else`);
  });
}

bootstrap();
