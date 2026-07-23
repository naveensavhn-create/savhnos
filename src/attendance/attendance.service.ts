import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { haversineDistanceMeters } from "@savhnos/shared";
import { PrismaService } from "../prisma/prisma.service";
import { ClockInDto } from "./dto/clock-in.dto";
import { ClockOutDto } from "./dto/clock-out.dto";

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private async getEmployeeForUser(userId: string, companyId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { userId, companyId } });
    if (!employee) {
      throw new NotFoundException("No employee profile linked to this account");
    }
    return employee;
  }

  async clockIn(userId: string, companyId: string, dto: ClockInDto) {
    const employee = await this.getEmployeeForUser(userId, companyId);

    const openAttendance = await this.prisma.attendance.findFirst({
      where: { employeeId: employee.id, clockOutAt: null },
    });
    if (openAttendance) {
      throw new BadRequestException("Already clocked in. Clock out before clocking in again.");
    }

    let distanceMeters: number | undefined;
    let withinGeofence = true;

    if (dto.projectId) {
      const geofence = await this.prisma.projectGeofence.findUnique({
        where: { projectId: dto.projectId },
      });
      if (geofence) {
        distanceMeters = haversineDistanceMeters(
          dto.latitude,
          dto.longitude,
          geofence.latitude,
          geofence.longitude
        );
        const allowedRadius = geofence.radiusMeters + geofence.softToleranceMeters;
        withinGeofence = distanceMeters <= allowedRadius;
        if (!withinGeofence) {
          throw new ForbiddenException(
            `You are ${Math.round(distanceMeters)}m from the site, outside the ${allowedRadius}m geofence. Ask an admin to override if needed.`
          );
        }
      }
    }

    return this.prisma.attendance.create({
      data: {
        employeeId: employee.id,
        projectId: dto.projectId,
        method: dto.projectId ? "GEOFENCE" : "OFFICE_WIFI",
        clockInLat: dto.latitude,
        clockInLng: dto.longitude,
        distanceMeters,
        withinGeofence,
      },
    });
  }

  async clockOut(userId: string, companyId: string, dto: ClockOutDto) {
    const employee = await this.getEmployeeForUser(userId, companyId);
    const openAttendance = await this.prisma.attendance.findFirst({
      where: { employeeId: employee.id, clockOutAt: null },
      orderBy: { clockInAt: "desc" },
    });
    if (!openAttendance) {
      throw new BadRequestException("No open clock-in found");
    }
    return this.prisma.attendance.update({
      where: { id: openAttendance.id },
      data: { clockOutAt: new Date(), clockOutLat: dto.latitude, clockOutLng: dto.longitude },
    });
  }

  async adminOverride(companyId: string, employeeId: string, projectId?: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, companyId } });
    if (!employee) throw new NotFoundException("Employee not found");

    return this.prisma.attendance.create({
      data: {
        employeeId: employee.id,
        projectId,
        method: "ADMIN_OVERRIDE",
        withinGeofence: true,
        overriddenByAdmin: true,
      },
    });
  }

  async myHistory(userId: string, companyId: string) {
    const employee = await this.getEmployeeForUser(userId, companyId);
    return this.prisma.attendance.findMany({
      where: { employeeId: employee.id },
      orderBy: { clockInAt: "desc" },
      take: 50,
      include: { project: { select: { name: true, code: true } } },
    });
  }

  async companyToday(companyId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this.prisma.attendance.findMany({
      where: { employee: { companyId }, clockInAt: { gte: startOfDay } },
      include: {
        employee: { include: { user: { select: { name: true } } } },
        project: { select: { name: true, code: true } },
      },
      orderBy: { clockInAt: "desc" },
    });
  }
}
