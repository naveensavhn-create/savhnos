import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { updateSafetyIncidentSchema } from "@/modules/safety/validators/safety.validators";
import { updateSafetyIncident } from "@/server/services/safety.service";
import { UserRole } from "@/lib/enums";

const INVESTIGATE_ROLES = [
  UserRole.OWNER,
  UserRole.SUPER_ADMIN,
  UserRole.HR,
  UserRole.QC_ENGINEER,
  UserRole.PROJECT_ENGINEER,
];

export const PATCH = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, updateSafetyIncidentSchema);
  if (error) return error;
  const incident = await updateSafetyIncident(session.user.companyId, params.id, data);
  return NextResponse.json(incident);
}, INVESTIGATE_ROLES);
