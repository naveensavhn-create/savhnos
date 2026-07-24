import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { myAttendanceHistory } from "@/server/services/attendance.service";

export const GET = withAuth(async (_req, { session }) => {
  const history = await myAttendanceHistory(session.user.id, session.user.companyId);
  return NextResponse.json(history);
});
