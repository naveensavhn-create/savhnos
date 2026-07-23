import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDrawingDto } from "./dto/create-drawing.dto";
import { UploadRevisionDto } from "./dto/upload-revision.dto";
import { ReviewRevisionDto } from "./dto/review-revision.dto";

@Injectable()
export class DrawingsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForProject(companyId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, companyId } });
    if (!project) throw new NotFoundException("Project not found");
    return this.prisma.drawing.findMany({
      where: { projectId },
      include: { revisions: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(companyId: string, dto: CreateDrawingDto) {
    const project = await this.prisma.project.findFirst({ where: { id: dto.projectId, companyId } });
    if (!project) throw new NotFoundException("Project not found");
    return this.prisma.drawing.create({
      data: { projectId: dto.projectId, title: dto.title, discipline: dto.discipline },
    });
  }

  async uploadRevision(companyId: string, drawingId: string, dto: UploadRevisionDto) {
    const drawing = await this.prisma.drawing.findFirst({
      where: { id: drawingId, project: { companyId } },
    });
    if (!drawing) throw new NotFoundException("Drawing not found");

    return this.prisma.$transaction(async (tx) => {
      await tx.drawingRevision.updateMany({
        where: { drawingId, status: "APPROVED" },
        data: { status: "SUPERSEDED" },
      });
      return tx.drawingRevision.create({
        data: {
          drawingId,
          versionLabel: dto.versionLabel,
          fileUrl: dto.fileUrl,
          fileType: dto.fileType,
          status: "IN_REVIEW",
        },
      });
    });
  }

  async reviewRevision(
    companyId: string,
    revisionId: string,
    reviewerId: string,
    dto: ReviewRevisionDto
  ) {
    const revision = await this.prisma.drawingRevision.findFirst({
      where: { id: revisionId, drawing: { project: { companyId } } },
    });
    if (!revision) throw new NotFoundException("Drawing revision not found");

    return this.prisma.$transaction(async (tx) => {
      await tx.drawingRevision.update({
        where: { id: revisionId },
        data: { status: dto.decision },
      });
      return tx.drawingReview.create({
        data: {
          drawingRevisionId: revisionId,
          reviewerId,
          decision: dto.decision,
          comments: dto.comments,
        },
      });
    });
  }
}
