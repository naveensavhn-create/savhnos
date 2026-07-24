import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { updateCompanySchema } from "@/modules/settings/validators/company.validators";
import { getCompanyById, updateCompany } from "@/server/services/company.service";
import { UserRole } from "@/lib/enums";

export const GET = withAuth(async (_req, { session }) => {
  const company = await getCompanyById(session.user.companyId);
  return NextResponse.json(company);
});

export const PATCH = withAuth(
  async (req, { session }) => {
    const { data, error } = await parseBody(req, updateCompanySchema);
    if (error) return error;
    const company = await updateCompany(session.user.companyId, data);
    return NextResponse.json(company);
  },
  [UserRole.OWNER, UserRole.SUPER_ADMIN]
);
