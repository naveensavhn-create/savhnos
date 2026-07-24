import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { createNCRSchema } from "@/modules/quality/validators/ncr.validators";
import { createNonConformance } from "@/server/services/quality.service";
import { UserRole } from "@/lib/enums";

const RAISE_ROLES = [
  UserRole.OWNER,
  UserRole.SUPER_ADMIN,
  UserRole.QC_ENGINEER,
  UserRole.PROJECT_ENGINEER,
  UserRole.SITE_ENGINEER,
];

export const POST = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, createNCRSchema);
  if (error) return error;
  const ncr = await createNonConformance(session.user.companyId, params.id, session.user.id, data);
  return NextResponse.json(ncr, { status: 201 });
}, RAISE_ROLES);
