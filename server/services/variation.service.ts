import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/server/errors";

export function listVariations(companyId: string, projectId: string) {
  return prisma.variation.findMany({
    where: { projectId, project: { companyId } },
    include: { requestedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export interface CreateVariationInput {
  variationNumber: string;
  title: string;
  description?: string;
  costImpact?: number;
  timeImpactDays?: number;
}

export async function createVariation(
  companyId: string,
  projectId: string,
  requestedById: string,
  input: CreateVariationInput
) {
  const project = await prisma.project.findFirst({ where: { id: projectId, companyId } });
  if (!project) throw new NotFoundError("Project not found");
  return prisma.variation.create({
    data: { projectId, requestedById, ...input, status: "SUBMITTED" },
  });
}

export async function decideVariation(
  companyId: string,
  variationId: string,
  status: "APPROVED" | "REJECTED"
) {
  const variation = await prisma.variation.findFirst({ where: { id: variationId, project: { companyId } } });
  if (!variation) throw new NotFoundError("Variation not found");
  return prisma.variation.update({ where: { id: variationId }, data: { status } });
}
