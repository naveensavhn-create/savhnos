import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/enums";
import { ConflictError } from "@/server/errors";

export function listUsers(companyId: string) {
  return prisma.user.findMany({
    where: { companyId },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function inviteUser(
  companyId: string,
  input: { name: string; email: string; password: string; role: UserRole }
) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: {
      companyId,
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
}

export function setUserActive(companyId: string, userId: string, isActive: boolean) {
  return prisma.user.update({
    where: { id: userId, companyId },
    data: { isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
}
