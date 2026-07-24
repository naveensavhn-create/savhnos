import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/enums";
import { ConflictError } from "@/server/errors";

export function listEmployees(companyId: string) {
  return prisma.employee.findMany({
    where: { companyId },
    include: { user: { select: { name: true, email: true, role: true, isActive: true } }, branch: true },
    orderBy: { createdAt: "desc" },
  });
}

export function findEmployee(companyId: string, id: string) {
  return prisma.employee.findFirst({
    where: { id, companyId },
    include: {
      user: { select: { name: true, email: true, role: true, isActive: true } },
      branch: true,
      attendances: { orderBy: { clockInAt: "desc" }, take: 20 },
      projectAssignments: { include: { project: true } },
    },
  });
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  employeeCode: string;
  designation?: string;
  department?: string;
  branchId?: string;
  phone?: string;
  dateOfJoining?: string;
  monthlySalary?: number;
}

export async function createEmployee(companyId: string, input: CreateEmployeeInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }
  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        companyId,
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
      },
    });

    return tx.employee.create({
      data: {
        companyId,
        userId: user.id,
        employeeCode: input.employeeCode,
        designation: input.designation,
        department: input.department,
        branchId: input.branchId,
        phone: input.phone,
        dateOfJoining: input.dateOfJoining ? new Date(input.dateOfJoining) : undefined,
        monthlySalary: input.monthlySalary,
      },
      include: { user: { select: { name: true, email: true, role: true } } },
    });
  });
}
