import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { findProject } from "@/server/services/project.service";

export const GET = withAuth(async (_req, { session, params }) => {
  const project = await findProject(session.user.companyId, params.id);
  return NextResponse.json(project);
});
