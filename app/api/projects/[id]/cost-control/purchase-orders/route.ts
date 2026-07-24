import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { createPurchaseOrderSchema } from "@/modules/finance/validators/cost-control.validators";
import { createPurchaseOrder } from "@/server/services/cost-control.service";
import { UserRole } from "@/lib/enums";

const PO_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.PROJECT_ENGINEER, UserRole.ACCOUNTANT];

export const POST = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, createPurchaseOrderSchema);
  if (error) return error;
  const po = await createPurchaseOrder(session.user.companyId, params.id, data);
  return NextResponse.json(po, { status: 201 });
}, PO_ROLES);
