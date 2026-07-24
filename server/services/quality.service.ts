import { prisma } from "@/lib/prisma";
import type { NCRDisposition, NCRStatus } from "@/lib/enums";
import { NotFoundError } from "@/server/errors";

export function listNonConformances(companyId: string, projectId?: string) {
  return prisma.nonConformance.findMany({
    where: { project: { companyId }, ...(projectId ? { projectId } : {}) },
    include: {
      project: { select: { name: true, code: true } },
      raisedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export interface CreateNCRInput {
  title: string;
  description?: string;
}

export async function createNonConformance(
  companyId: string,
  projectId: string,
  raisedById: string,
  input: CreateNCRInput
) {
  const project = await prisma.project.findFirst({ where: { id: projectId, companyId } });
  if (!project) throw new NotFoundError("Project not found");
  return prisma.nonConformance.create({ data: { projectId, raisedById, ...input } });
}

export interface UpdateNCRInput {
  status?: NCRStatus;
  disposition?: NCRDisposition;
  closureEvidence?: string;
}

export async function updateNonConformance(companyId: string, ncrId: string, input: UpdateNCRInput) {
  const ncr = await prisma.nonConformance.findFirst({ where: { id: ncrId, project: { companyId } } });
  if (!ncr) throw new NotFoundError("NCR not found");
  return prisma.nonConformance.update({ where: { id: ncrId }, data: input });
}
