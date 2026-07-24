import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { listNonConformances } from "@/server/services/quality.service";

export const GET = withAuth(async (req, { session }) => {
  const projectId = new URL(req.url).searchParams.get("projectId") ?? undefined;
  const ncrs = await listNonConformances(session.user.companyId, projectId);
  return NextResponse.json(ncrs);
});
