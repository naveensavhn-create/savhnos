import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { listSafetyIncidents } from "@/server/services/safety.service";

export const GET = withAuth(async (req, { session }) => {
  const projectId = new URL(req.url).searchParams.get("projectId") ?? undefined;
  const incidents = await listSafetyIncidents(session.user.companyId, projectId);
  return NextResponse.json(incidents);
});
