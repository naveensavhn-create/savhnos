import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { getCostControlReport } from "@/server/services/cost-control.service";

export const GET = withAuth(async (_req, { session, params }) => {
  const report = await getCostControlReport(session.user.companyId, params.id);
  return NextResponse.json(report);
});
