import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { clockOutSchema } from "@/modules/attendance/validators/attendance.validators";
import { clockOut } from "@/server/services/attendance.service";

export const POST = withAuth(async (req, { session }) => {
  const { data, error } = await parseBody(req, clockOutSchema);
  if (error) return error;
  const attendance = await clockOut(session.user.id, session.user.companyId, data);
  return NextResponse.json(attendance);
});
