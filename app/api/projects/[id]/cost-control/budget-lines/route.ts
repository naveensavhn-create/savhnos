import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { upsertBudgetLineSchema } from "@/modules/finance/validators/cost-control.validators";
import { upsertBudgetLine } from "@/server/services/cost-control.service";
import { UserRole } from "@/lib/enums";

const BUDGET_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT];

export const POST = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, upsertBudgetLineSchema);
  if (error) return error;
  const line = await upsertBudgetLine(session.user.companyId, params.id, data);
  return NextResponse.json(line, { status: 201 });
}, BUDGET_ROLES);
