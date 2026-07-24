import { NextResponse } from "next/server";
import { publicRoute } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { registerCompanySchema } from "@/modules/settings/validators/auth.validators";
import { registerCompany } from "@/server/services/company.service";

export const POST = publicRoute(async (req) => {
  const { data, error } = await parseBody(req, registerCompanySchema);
  if (error) return error;

  const owner = await registerCompany(data);
  return NextResponse.json(owner, { status: 201 });
});
