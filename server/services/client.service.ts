import { prisma } from "@/lib/prisma";
import type { PipelineStage } from "@/lib/enums";
import { NotFoundError } from "@/server/errors";

export function listClients(companyId: string) {
  return prisma.client.findMany({
    where: { companyId },
    include: { _count: { select: { projects: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function findClient(companyId: string, id: string) {
  const client = await prisma.client.findFirst({
    where: { id, companyId },
    include: { projects: true, invoices: true },
  });
  if (!client) throw new NotFoundError("Client not found");
  return client;
}

export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  organization?: string;
  pipelineStage?: PipelineStage;
  estimatedValue?: number;
}

export function createClient(companyId: string, input: CreateClientInput) {
  return prisma.client.create({ data: { ...input, companyId } });
}

export async function updateClient(companyId: string, id: string, input: Partial<CreateClientInput>) {
  const client = await prisma.client.findFirst({ where: { id, companyId } });
  if (!client) throw new NotFoundError("Client not found");
  return prisma.client.update({ where: { id }, data: input });
}
