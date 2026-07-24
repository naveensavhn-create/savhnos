import { prisma } from "@/lib/prisma";
import type { DrawingStatus } from "@/lib/enums";
import { NotFoundError } from "@/server/errors";

export async function listDrawingsForProject(companyId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, companyId } });
  if (!project) throw new NotFoundError("Project not found");
  return prisma.drawing.findMany({
    where: { projectId },
    include: { revisions: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDrawing(
  companyId: string,
  input: { projectId: string; title: string; discipline?: string }
) {
  const project = await prisma.project.findFirst({ where: { id: input.projectId, companyId } });
  if (!project) throw new NotFoundError("Project not found");
  return prisma.drawing.create({
    data: { projectId: input.projectId, title: input.title, discipline: input.discipline },
  });
}

export async function uploadRevision(
  companyId: string,
  drawingId: string,
  input: { versionLabel: string; fileUrl: string; fileType?: string }
) {
  const drawing = await prisma.drawing.findFirst({
    where: { id: drawingId, project: { companyId } },
  });
  if (!drawing) throw new NotFoundError("Drawing not found");

  return prisma.$transaction(async (tx) => {
    await tx.drawingRevision.updateMany({
      where: { drawingId, status: "APPROVED" },
      data: { status: "SUPERSEDED" },
    });
    return tx.drawingRevision.create({
      data: {
        drawingId,
        versionLabel: input.versionLabel,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        status: "IN_REVIEW",
      },
    });
  });
}

export async function reviewRevision(
  companyId: string,
  revisionId: string,
  reviewerId: string,
  input: { decision: DrawingStatus; comments?: string }
) {
  const revision = await prisma.drawingRevision.findFirst({
    where: { id: revisionId, drawing: { project: { companyId } } },
  });
  if (!revision) throw new NotFoundError("Drawing revision not found");

  return prisma.$transaction(async (tx) => {
    await tx.drawingRevision.update({
      where: { id: revisionId },
      data: { status: input.decision },
    });
    return tx.drawingReview.create({
      data: {
        drawingRevisionId: revisionId,
        reviewerId,
        decision: input.decision,
        comments: input.comments,
      },
    });
  });
}
