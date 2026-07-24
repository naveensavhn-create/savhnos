import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { updateNCRSchema } from "@/modules/quality/validators/ncr.validators";
import { updateNonConformance } from "@/server/services/quality.service";
import { UserRole } from "@/lib/enums";

const DISPOSITION_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.QC_ENGINEER, UserRole.PROJECT_ENGINEER];

export const PATCH = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, updateNCRSchema);
  if (error) return error;
  const ncr = await updateNonConformance(session.user.companyId, params.id, data);
  return NextResponse.json(ncr);
}, DISPOSITION_ROLES);
