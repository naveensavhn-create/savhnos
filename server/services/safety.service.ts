import { prisma } from "@/lib/prisma";
import type { IncidentSeverity, IncidentStatus } from "@/lib/enums";
import { NotFoundError } from "@/server/errors";

export function listSafetyIncidents(companyId: string, projectId?: string) {
  return prisma.safetyIncident.findMany({
    where: { project: { companyId }, ...(projectId ? { projectId } : {}) },
    include: {
      project: { select: { name: true, code: true } },
      reportedBy: { select: { name: true } },
    },
    orderBy: { occurredAt: "desc" },
  });
}

export interface CreateSafetyIncidentInput {
  title: string;
  description?: string;
  severity: IncidentSeverity;
  occurredAt?: string;
}

export async function createSafetyIncident(
  companyId: string,
  projectId: string,
  reportedById: string,
  input: CreateSafetyIncidentInput
) {
  const project = await prisma.project.findFirst({ where: { id: projectId, companyId } });
  if (!project) throw new NotFoundError("Project not found");
  return prisma.safetyIncident.create({
    data: {
      projectId,
      reportedById,
      title: input.title,
      description: input.description,
      severity: input.severity,
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : undefined,
    },
  });
}

export interface UpdateSafetyIncidentInput {
  status?: IncidentStatus;
  rootCause?: string;
  correctiveAction?: string;
}

export async function updateSafetyIncident(
  companyId: string,
  incidentId: string,
  input: UpdateSafetyIncidentInput
) {
  const incident = await prisma.safetyIncident.findFirst({ where: { id: incidentId, project: { companyId } } });
  if (!incident) throw new NotFoundError("Safety incident not found");
  return prisma.safetyIncident.update({ where: { id: incidentId }, data: input });
}
