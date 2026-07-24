import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { updatePurchaseOrderStatusSchema } from "@/modules/finance/validators/cost-control.validators";
import { updatePurchaseOrderStatus } from "@/server/services/cost-control.service";
import { UserRole } from "@/lib/enums";

const PO_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.PROJECT_ENGINEER, UserRole.ACCOUNTANT];

export const PATCH = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, updatePurchaseOrderStatusSchema);
  if (error) return error;
  const po = await updatePurchaseOrderStatus(session.user.companyId, params.id, data.status);
  return NextResponse.json(po);
}, PO_ROLES);
