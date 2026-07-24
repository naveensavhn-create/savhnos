import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/enums";
import { ConflictError } from "@/server/errors";

export interface RegisterCompanyInput {
  companyName: string;
  ownerName: string;
  email: string;
  password: string;
}

/** Creates a company and its OWNER user. Ported from AuthService.registerCompany. */
export async function registerCompany(input: RegisterCompanyInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const company = await prisma.company.create({
    data: {
      name: input.companyName,
      users: {
        create: {
          email: input.email,
          name: input.ownerName,
          passwordHash,
          role: UserRole.OWNER,
        },
      },
    },
    include: {
      users: {
        select: { id: true, email: true, name: true, role: true, companyId: true, isActive: true, createdAt: true },
      },
    },
  });

  return company.users[0];
}

export function getCompanyById(companyId: string) {
  return prisma.company.findUnique({ where: { id: companyId } });
}

export function updateCompany(companyId: string, data: { name?: string; logoUrl?: string; gstNumber?: string }) {
  return prisma.company.update({ where: { id: companyId }, data });
}

export function listBranches(companyId: string) {
  return prisma.branch.findMany({ where: { companyId }, orderBy: { name: "asc" } });
}

export function createBranch(companyId: string, data: { name: string; address?: string; city?: string }) {
  return prisma.branch.create({ data: { ...data, companyId } });
}
