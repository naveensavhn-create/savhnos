import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { createBranchSchema } from "@/modules/settings/validators/company.validators";
import { createBranch, listBranches } from "@/server/services/company.service";
import { UserRole } from "@/lib/enums";

export const GET = withAuth(async (_req, { session }) => {
  const branches = await listBranches(session.user.companyId);
  return NextResponse.json(branches);
});

export const POST = withAuth(
  async (req, { session }) => {
    const { data, error } = await parseBody(req, createBranchSchema);
    if (error) return error;
    const branch = await createBranch(session.user.companyId, data);
    return NextResponse.json(branch, { status: 201 });
  },
  [UserRole.OWNER, UserRole.SUPER_ADMIN]
);
