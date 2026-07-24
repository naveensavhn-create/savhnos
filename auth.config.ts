import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the Auth.js config, used by middleware.ts. Must not
 * import the Credentials provider (it pulls in bcryptjs, which needs Node
 * APIs unavailable in the Edge middleware runtime).
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
} satisfies NextAuthConfig;
