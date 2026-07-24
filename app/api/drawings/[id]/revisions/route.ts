import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { uploadRevisionSchema } from "@/modules/drawings/validators/drawing.validators";
import { uploadRevision } from "@/server/services/drawing.service";

export const POST = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, uploadRevisionSchema);
  if (error) return error;
  const revision = await uploadRevision(session.user.companyId, params.id, data);
  return NextResponse.json(revision, { status: 201 });
});
