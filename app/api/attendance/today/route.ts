import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { companyAttendanceToday } from "@/server/services/attendance.service";
import { ATTENDANCE_VIEW_ROLES } from "@/lib/permissions";

export const GET = withAuth(async (_req, { session }) => {
  const attendance = await companyAttendanceToday(session.user.companyId);
  return NextResponse.json(attendance);
}, ATTENDANCE_VIEW_ROLES);
