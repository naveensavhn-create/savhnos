import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { clockInSchema } from "@/modules/attendance/validators/attendance.validators";
import { clockIn } from "@/server/services/attendance.service";

export const POST = withAuth(async (req, { session }) => {
  const { data, error } = await parseBody(req, clockInSchema);
  if (error) return error;
  const attendance = await clockIn(session.user.id, session.user.companyId, data);
  return NextResponse.json(attendance, { status: 201 });
});
