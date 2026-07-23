import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload, UserRole } from "@savhnos/shared";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateGeofenceDto } from "./dto/update-geofence.dto";
import { AssignEmployeeDto } from "./dto/assign-employee.dto";

const MANAGE_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.PROJECT_ENGINEER];

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.projectsService.list(user.companyId);
  }

  @Get(":id")
  findOne(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.projectsService.findOne(user.companyId, id);
  }

  @Post()
  @Roles(...MANAGE_ROLES)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.companyId, dto);
  }

  @Put(":id/geofence")
  @Roles(...MANAGE_ROLES)
  upsertGeofence(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateGeofenceDto
  ) {
    return this.projectsService.upsertGeofence(user.companyId, id, dto);
  }

  @Post(":id/assign")
  @Roles(...MANAGE_ROLES, UserRole.HR)
  assign(@CurrentUser() user: JwtPayload, @Param("id") id: string, @Body() dto: AssignEmployeeDto) {
    return this.projectsService.assignEmployee(user.companyId, id, dto);
  }
}
