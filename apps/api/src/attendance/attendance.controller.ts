import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtPayload, UserRole } from "@savhnos/shared";
import { AttendanceService } from "./attendance.service";
import { ClockInDto } from "./dto/clock-in.dto";
import { ClockOutDto } from "./dto/clock-out.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post("clock-in")
  clockIn(@CurrentUser() user: JwtPayload, @Body() dto: ClockInDto) {
    return this.attendanceService.clockIn(user.sub, user.companyId, dto);
  }

  @Post("clock-out")
  clockOut(@CurrentUser() user: JwtPayload, @Body() dto: ClockOutDto) {
    return this.attendanceService.clockOut(user.sub, user.companyId, dto);
  }

  @Get("me")
  myHistory(@CurrentUser() user: JwtPayload) {
    return this.attendanceService.myHistory(user.sub, user.companyId);
  }

  @Get("today")
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.HR, UserRole.PROJECT_ENGINEER)
  today(@CurrentUser() user: JwtPayload) {
    return this.attendanceService.companyToday(user.companyId);
  }

  @Post("override/:employeeId")
  @Roles(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.HR)
  override(
    @CurrentUser() user: JwtPayload,
    @Param("employeeId") employeeId: string,
    @Query("projectId") projectId?: string
  ) {
    return this.attendanceService.adminOverride(user.companyId, employeeId, projectId);
  }
}
