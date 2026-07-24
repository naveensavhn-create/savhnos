import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { reviewRevisionSchema } from "@/modules/drawings/validators/drawing.validators";
import { reviewRevision } from "@/server/services/drawing.service";
import { UserRole } from "@/lib/enums";

const APPROVER_ROLES = [
  UserRole.OWNER,
  UserRole.SUPER_ADMIN,
  UserRole.PROJECT_ENGINEER,
  UserRole.QC_ENGINEER,
];

export const POST = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, reviewRevisionSchema);
  if (error) return error;
  const review = await reviewRevision(session.user.companyId, params.revisionId, session.user.id, data);
  return NextResponse.json(review, { status: 201 });
}, APPROVER_ROLES);
