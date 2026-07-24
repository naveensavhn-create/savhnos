import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { createProjectSchema } from "@/modules/projects/validators/project.validators";
import { createProject, listProjects } from "@/server/services/project.service";
import { UserRole } from "@/lib/enums";

const MANAGE_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.PROJECT_ENGINEER];

export const GET = withAuth(async (_req, { session }) => {
  const projects = await listProjects(session.user.companyId);
  return NextResponse.json(projects);
});

export const POST = withAuth(async (req, { session }) => {
  const { data, error } = await parseBody(req, createProjectSchema);
  if (error) return error;
  const project = await createProject(session.user.companyId, data);
  return NextResponse.json(project, { status: 201 });
}, MANAGE_ROLES);
