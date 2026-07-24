import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

/**
 * Replaces NestJS's ValidationPipe({ whitelist, transform, forbidNonWhitelisted }).
 * Returns the same response shape Nest's default validation error did:
 * { message: string[], error: "Bad Request", statusCode: 400 }
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error?: undefined } | { data?: undefined; error: Response }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return {
      error: NextResponse.json(
        { message: ["Invalid JSON body"], error: "Bad Request", statusCode: 400 },
        { status: 400 }
      ),
    };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    const messages = result.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`.trim());
    return {
      error: NextResponse.json({ message: messages, error: "Bad Request", statusCode: 400 }, { status: 400 }),
    };
  }

  return { data: result.data };
}
