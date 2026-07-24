import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { createVariationSchema } from "@/modules/contracts/validators/variation.validators";
import { createVariation, listVariations } from "@/server/services/variation.service";
import { UserRole } from "@/lib/enums";

const RAISE_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.PROJECT_ENGINEER, UserRole.ARCHITECT];

export const GET = withAuth(async (_req, { session, params }) => {
  const variations = await listVariations(session.user.companyId, params.id);
  return NextResponse.json(variations);
});

export const POST = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, createVariationSchema);
  if (error) return error;
  const variation = await createVariation(session.user.companyId, params.id, session.user.id, data);
  return NextResponse.json(variation, { status: 201 });
}, RAISE_ROLES);
