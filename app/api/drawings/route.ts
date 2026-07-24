import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { createDrawingSchema } from "@/modules/drawings/validators/drawing.validators";
import { createDrawing, listDrawingsForProject } from "@/server/services/drawing.service";
import { BadRequestError } from "@/server/errors";

export const GET = withAuth(async (req, { session }) => {
  const projectId = new URL(req.url).searchParams.get("projectId");
  if (!projectId) throw new BadRequestError("projectId query parameter is required");
  const drawings = await listDrawingsForProject(session.user.companyId, projectId);
  return NextResponse.json(drawings);
});

export const POST = withAuth(async (req, { session }) => {
  const { data, error } = await parseBody(req, createDrawingSchema);
  if (error) return error;
  const drawing = await createDrawing(session.user.companyId, data);
  return NextResponse.json(drawing, { status: 201 });
});
