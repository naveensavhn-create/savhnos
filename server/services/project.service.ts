import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@/lib/enums";
import { NotFoundError } from "@/server/errors";

export function listProjects(companyId: string) {
  return prisma.project.findMany({
    where: { companyId },
    include: { geofence: true, client: true, _count: { select: { assignments: true, tasks: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function findProject(companyId: string, id: string) {
  const project = await prisma.project.findFirst({
    where: { id, companyId },
    include: {
      geofence: true,
      client: true,
      assignments: { include: { employee: { include: { user: true } } } },
      tasks: true,
    },
  });
  if (!project) throw new NotFoundError("Project not found");
  return project;
}

export interface CreateProjectInput {
  name: string;
  code: string;
  status?: ProjectStatus;
  clientId?: string;
  budget?: number;
  startDate?: string;
  targetEndDate?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  softToleranceMeters?: number;
}

export function createProject(companyId: string, input: CreateProjectInput) {
  const hasGeofence = input.latitude !== undefined && input.longitude !== undefined;
  return prisma.project.create({
    data: {
      companyId,
      name: input.name,
      code: input.code,
      status: input.status,
      clientId: input.clientId,
      budget: input.budget,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      targetEndDate: input.targetEndDate ? new Date(input.targetEndDate) : undefined,
      address: input.address,
      geofence: hasGeofence
        ? {
            create: {
              latitude: input.latitude!,
              longitude: input.longitude!,
              radiusMeters: input.radiusMeters ?? 150,
              softToleranceMeters: input.softToleranceMeters ?? 100,
            },
          }
        : undefined,
    },
    include: { geofence: true },
  });
}

export interface UpdateGeofenceInput {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  softToleranceMeters?: number;
}

export async function upsertGeofence(companyId: string, projectId: string, input: UpdateGeofenceInput) {
  const project = await prisma.project.findFirst({ where: { id: projectId, companyId } });
  if (!project) throw new NotFoundError("Project not found");

  return prisma.projectGeofence.upsert({
    where: { projectId },
    create: {
      projectId,
      latitude: input.latitude,
      longitude: input.longitude,
      radiusMeters: input.radiusMeters ?? 150,
      softToleranceMeters: input.softToleranceMeters ?? 100,
    },
    update: {
      latitude: input.latitude,
      longitude: input.longitude,
      radiusMeters: input.radiusMeters,
      softToleranceMeters: input.softToleranceMeters,
    },
  });
}

export async function assignEmployee(
  companyId: string,
  projectId: string,
  input: { employeeId: string; roleOnSite?: string }
) {
  const project = await prisma.project.findFirst({ where: { id: projectId, companyId } });
  if (!project) throw new NotFoundError("Project not found");

  return prisma.projectAssignment.upsert({
    where: { projectId_employeeId: { projectId, employeeId: input.employeeId } },
    create: { projectId, employeeId: input.employeeId, roleOnSite: input.roleOnSite },
    update: { roleOnSite: input.roleOnSite },
  });
}
