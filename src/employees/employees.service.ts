import { ConflictException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.employee.findMany({
      where: { companyId },
      include: { user: { select: { name: true, email: true, role: true, isActive: true } }, branch: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findOne(companyId: string, id: string) {
    return this.prisma.employee.findFirst({
      where: { id, companyId },
      include: {
        user: { select: { name: true, email: true, role: true, isActive: true } },
        branch: true,
        attendances: { orderBy: { clockInAt: "desc" }, take: 20 },
        projectAssignments: { include: { project: true } },
      },
    });
  }

  async create(companyId: string, dto: CreateEmployeeDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          companyId,
          name: dto.name,
          email: dto.email,
          passwordHash,
          role: dto.role,
        },
      });

      return tx.employee.create({
        data: {
          companyId,
          userId: user.id,
          employeeCode: dto.employeeCode,
          designation: dto.designation,
          department: dto.department,
          branchId: dto.branchId,
          phone: dto.phone,
          dateOfJoining: dto.dateOfJoining ? new Date(dto.dateOfJoining) : undefined,
          monthlySalary: dto.monthlySalary,
        },
        include: { user: { select: { name: true, email: true, role: true } } },
      });
    });
  }
}
