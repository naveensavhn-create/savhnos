import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { findEmployee } from "@/server/services/employee.service";

export const GET = withAuth(async (_req, { session, params }) => {
  const employee = await findEmployee(session.user.companyId, params.id);
  return NextResponse.json(employee);
});
