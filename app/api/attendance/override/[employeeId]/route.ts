import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { adminOverride } from "@/server/services/attendance.service";
import { UserRole } from "@/lib/enums";

const OVERRIDE_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.HR];

export const POST = withAuth(async (req, { session, params }) => {
  const projectId = new URL(req.url).searchParams.get("projectId") ?? undefined;
  const attendance = await adminOverride(session.user.companyId, params.employeeId, projectId);
  return NextResponse.json(attendance, { status: 201 });
}, OVERRIDE_ROLES);
