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

/**
 * Fail fast with a message that says exactly what's wrong, instead of a
 * multi-hundred-line Prisma stack trace (or, on some hosts, no log output
 * at all — just a silently-dead process that the web server falls back to
 * serving a generic 403/404 for). This one check accounts for the majority
 * of "app won't start" support time on a fresh shared-hosting deploy.
 */
function validateEnv() {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      [
        "",
        "✖ savhnos failed to start: missing required environment variable(s).",
        `  ${missing.join(", ")}`,
        "",
        "  Set these in your hosting panel's Node.js App → Environment Variables",
        "  screen, then restart the app. See DEPLOY.md for what each one needs.",
        "",
      ].join("\n")
    );
    process.exit(1);
  }

  if (!/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL!.trim())) {
    // eslint-disable-next-line no-console
    console.error(
      [
        "",
        "✖ savhnos failed to start: DATABASE_URL doesn't look like a Postgres",
        "  connection string (expected it to start with postgres:// or",
        "  postgresql://). This app needs Postgres — most shared hosting plans",
        "  (including Hostinger's) only provide MySQL, so you'll need an",
        "  external Postgres such as Neon or Supabase. See DEPLOY.md.",
        "",
      ].join("\n")
    );
    process.exit(1);
  }
}

async function bootstrap() {
  validateEnv();

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

process.on("unhandledRejection", (err) => {
  // eslint-disable-next-line no-console
  console.error("✖ Unhandled rejection during startup or request handling:", err);
});

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("✖ savhnos failed to start:", err);
  process.exit(1);
});
