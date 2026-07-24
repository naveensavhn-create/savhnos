import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { decideVariationSchema } from "@/modules/contracts/validators/variation.validators";
import { decideVariation } from "@/server/services/variation.service";
import { UserRole } from "@/lib/enums";

const DECIDE_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.PROJECT_ENGINEER];

export const PATCH = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, decideVariationSchema);
  if (error) return error;
  const variation = await decideVariation(session.user.companyId, params.id, data.status);
  return NextResponse.json(variation);
}, DECIDE_ROLES);
