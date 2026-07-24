import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { createSafetyIncidentSchema } from "@/modules/safety/validators/safety.validators";
import { createSafetyIncident } from "@/server/services/safety.service";

export const POST = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, createSafetyIncidentSchema);
  if (error) return error;
  const incident = await createSafetyIncident(session.user.companyId, params.id, session.user.id, data);
  return NextResponse.json(incident, { status: 201 });
});
