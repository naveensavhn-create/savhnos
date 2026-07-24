import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Validates email/password against the User table. Mirrors what the old
 * NestJS AuthService.login did (find by email, check isActive, bcrypt
 * compare) — this is the Auth.js Credentials provider's `authorize`.
 * Returns null on any failure; Auth.js turns that into a generic
 * CredentialsSignin error surfaced to the client.
 */
export async function authorizeCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
  };
}
