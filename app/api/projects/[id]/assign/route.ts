import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { assignEmployeeSchema } from "@/modules/projects/validators/project.validators";
import { assignEmployee } from "@/server/services/project.service";
import { UserRole } from "@/lib/enums";

const MANAGE_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.PROJECT_ENGINEER, UserRole.HR];

export const POST = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, assignEmployeeSchema);
  if (error) return error;
  const assignment = await assignEmployee(session.user.companyId, params.id, data);
  return NextResponse.json(assignment, { status: 201 });
}, MANAGE_ROLES);
