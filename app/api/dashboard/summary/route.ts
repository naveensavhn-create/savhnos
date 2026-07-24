import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { getDashboardSummary } from "@/server/services/dashboard.service";

export const GET = withAuth(async (_req, { session }) => {
  const summary = await getDashboardSummary(session.user.companyId);
  return NextResponse.json(summary);
});
