import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateGeofenceDto } from "./dto/update-geofence.dto";
import { AssignEmployeeDto } from "./dto/assign-employee.dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.project.findMany({
      where: { companyId },
      include: { geofence: true, client: true, _count: { select: { assignments: true, tasks: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(companyId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, companyId },
      include: {
        geofence: true,
        client: true,
        assignments: { include: { employee: { include: { user: true } } } },
        tasks: true,
      },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  create(companyId: string, dto: CreateProjectDto) {
    const hasGeofence = dto.latitude !== undefined && dto.longitude !== undefined;
    return this.prisma.project.create({
      data: {
        companyId,
        name: dto.name,
        code: dto.code,
        status: dto.status,
        clientId: dto.clientId,
        budget: dto.budget,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        targetEndDate: dto.targetEndDate ? new Date(dto.targetEndDate) : undefined,
        address: dto.address,
        geofence: hasGeofence
          ? {
              create: {
                latitude: dto.latitude!,
                longitude: dto.longitude!,
                radiusMeters: dto.radiusMeters ?? 150,
                softToleranceMeters: dto.softToleranceMeters ?? 100,
              },
            }
          : undefined,
      },
      include: { geofence: true },
    });
  }

  async upsertGeofence(companyId: string, projectId: string, dto: UpdateGeofenceDto) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, companyId } });
    if (!project) throw new NotFoundException("Project not found");

    return this.prisma.projectGeofence.upsert({
      where: { projectId },
      create: {
        projectId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        radiusMeters: dto.radiusMeters ?? 150,
        softToleranceMeters: dto.softToleranceMeters ?? 100,
      },
      update: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        radiusMeters: dto.radiusMeters,
        softToleranceMeters: dto.softToleranceMeters,
      },
    });
  }

  async assignEmployee(companyId: string, projectId: string, dto: AssignEmployeeDto) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, companyId } });
    if (!project) throw new NotFoundException("Project not found");

    return this.prisma.projectAssignment.upsert({
      where: { projectId_employeeId: { projectId, employeeId: dto.employeeId } },
      create: { projectId, employeeId: dto.employeeId, roleOnSite: dto.roleOnSite },
      update: { roleOnSite: dto.roleOnSite },
    });
  }
}
