import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ApiError } from "@/server/errors";
import type { UserRole } from "@/lib/enums";
import type { Session } from "next-auth";

type RouteContext = { params: Promise<Record<string, string>> };
type Handler = (
  req: Request,
  ctx: { session: Session; params: Record<string, string> }
) => Promise<Response> | Response;

/**
 * Replaces NestJS's JwtAuthGuard + RolesGuard combo for Route Handlers, and
 * also catches ApiError thrown by service-layer code (replacing Nest's
 * HttpException handling). Mirrors the exact response shapes the old API
 * returned so nothing scripting against the API has to change:
 *   401 -> { message: "Unauthorized", statusCode: 401 }
 *   403 -> { message: "Forbidden resource", error: "Forbidden", statusCode: 403 }
 */
export function withAuth(handler: Handler, allowedRoles?: UserRole[]) {
  return async (req: Request, ctx: RouteContext) => {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized", statusCode: 401 }, { status: 401 });
    }
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { message: "Forbidden resource", error: "Forbidden", statusCode: 403 },
        { status: 403 }
      );
    }

    const params = ctx?.params ? await ctx.params : {};

    try {
      return await handler(req, { session, params });
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ message: err.message, statusCode: err.status }, { status: err.status });
      }
      throw err;
    }
  };
}

type PublicHandler = (req: Request, ctx: { params: Record<string, string> }) => Promise<Response> | Response;

/** Same ApiError handling as withAuth, for routes that don't require a session (e.g. register). */
export function publicRoute(handler: PublicHandler) {
  return async (req: Request, ctx: RouteContext) => {
    const params = ctx?.params ? await ctx.params : {};
    try {
      return await handler(req, { params });
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ message: err.message, statusCode: err.status }, { status: err.status });
      }
      throw err;
    }
  };
}
