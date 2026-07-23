import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload, UserRole } from "@savhnos/shared";
import { DrawingsService } from "./drawings.service";
import { CreateDrawingDto } from "./dto/create-drawing.dto";
import { UploadRevisionDto } from "./dto/upload-revision.dto";
import { ReviewRevisionDto } from "./dto/review-revision.dto";

const APPROVER_ROLES = [
  UserRole.OWNER,
  UserRole.SUPER_ADMIN,
  UserRole.PROJECT_ENGINEER,
  UserRole.QC_ENGINEER,
];

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("drawings")
export class DrawingsController {
  constructor(private readonly drawingsService: DrawingsService) {}

  @Get()
  listForProject(@CurrentUser() user: JwtPayload, @Query("projectId") projectId: string) {
    return this.drawingsService.listForProject(user.companyId, projectId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDrawingDto) {
    return this.drawingsService.create(user.companyId, dto);
  }

  @Post(":id/revisions")
  uploadRevision(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UploadRevisionDto
  ) {
    return this.drawingsService.uploadRevision(user.companyId, id, dto);
  }

  @Post("revisions/:revisionId/review")
  @Roles(...APPROVER_ROLES)
  reviewRevision(
    @CurrentUser() user: JwtPayload,
    @Param("revisionId") revisionId: string,
    @Body() dto: ReviewRevisionDto
  ) {
    return this.drawingsService.reviewRevision(user.companyId, revisionId, user.sub, dto);
  }
}
