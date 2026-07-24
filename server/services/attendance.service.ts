import { prisma } from "@/lib/prisma";
import { haversineDistanceMeters } from "@/lib/geo";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/server/errors";

async function getEmployeeForUser(userId: string, companyId: string) {
  const employee = await prisma.employee.findFirst({ where: { userId, companyId } });
  if (!employee) {
    throw new NotFoundError("No employee profile linked to this account");
  }
  return employee;
}

export interface ClockInInput {
  projectId?: string;
  latitude: number;
  longitude: number;
}

export async function clockIn(userId: string, companyId: string, input: ClockInInput) {
  const employee = await getEmployeeForUser(userId, companyId);

  const openAttendance = await prisma.attendance.findFirst({
    where: { employeeId: employee.id, clockOutAt: null },
  });
  if (openAttendance) {
    throw new BadRequestError("Already clocked in. Clock out before clocking in again.");
  }

  let distanceMeters: number | undefined;
  let withinGeofence = true;

  if (input.projectId) {
    const geofence = await prisma.projectGeofence.findUnique({
      where: { projectId: input.projectId },
    });
    if (geofence) {
      distanceMeters = haversineDistanceMeters(input.latitude, input.longitude, geofence.latitude, geofence.longitude);
      const allowedRadius = geofence.radiusMeters + geofence.softToleranceMeters;
      withinGeofence = distanceMeters <= allowedRadius;
      if (!withinGeofence) {
        throw new ForbiddenError(
          `You are ${Math.round(distanceMeters)}m from the site, outside the ${allowedRadius}m geofence. Ask an admin to override if needed.`
        );
      }
    }
  }

  return prisma.attendance.create({
    data: {
      employeeId: employee.id,
      projectId: input.projectId,
      method: input.projectId ? "GEOFENCE" : "OFFICE_WIFI",
      clockInLat: input.latitude,
      clockInLng: input.longitude,
      distanceMeters,
      withinGeofence,
    },
  });
}

export interface ClockOutInput {
  latitude: number;
  longitude: number;
}

export async function clockOut(userId: string, companyId: string, input: ClockOutInput) {
  const employee = await getEmployeeForUser(userId, companyId);
  const openAttendance = await prisma.attendance.findFirst({
    where: { employeeId: employee.id, clockOutAt: null },
    orderBy: { clockInAt: "desc" },
  });
  if (!openAttendance) {
    throw new BadRequestError("No open clock-in found");
  }
  return prisma.attendance.update({
    where: { id: openAttendance.id },
    data: { clockOutAt: new Date(), clockOutLat: input.latitude, clockOutLng: input.longitude },
  });
}

export async function adminOverride(companyId: string, employeeId: string, projectId?: string) {
  const employee = await prisma.employee.findFirst({ where: { id: employeeId, companyId } });
  if (!employee) throw new NotFoundError("Employee not found");

  return prisma.attendance.create({
    data: {
      employeeId: employee.id,
      projectId,
      method: "ADMIN_OVERRIDE",
      withinGeofence: true,
      overriddenByAdmin: true,
    },
  });
}

export async function myAttendanceHistory(userId: string, companyId: string) {
  const employee = await getEmployeeForUser(userId, companyId);
  return prisma.attendance.findMany({
    where: { employeeId: employee.id },
    orderBy: { clockInAt: "desc" },
    take: 50,
    include: { project: { select: { name: true, code: true } } },
  });
}

export async function companyAttendanceToday(companyId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return prisma.attendance.findMany({
    where: { employee: { companyId }, clockInAt: { gte: startOfDay } },
    include: {
      employee: { include: { user: { select: { name: true } } } },
      project: { select: { name: true, code: true } },
    },
    orderBy: { clockInAt: "desc" },
  });
}
