import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { companyAttendanceToday } from "@/server/services/attendance.service";
import { UserRole } from "@/lib/enums";

const VIEW_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.HR, UserRole.PROJECT_ENGINEER];

export const GET = withAuth(async (_req, { session }) => {
  const attendance = await companyAttendanceToday(session.user.companyId);
  return NextResponse.json(attendance);
}, VIEW_ROLES);
