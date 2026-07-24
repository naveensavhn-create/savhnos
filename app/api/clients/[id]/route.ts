import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { updateClientSchema } from "@/modules/clients/validators/client.validators";
import { findClient, updateClient } from "@/server/services/client.service";

export const GET = withAuth(async (_req, { session, params }) => {
  const client = await findClient(session.user.companyId, params.id);
  return NextResponse.json(client);
});

export const PATCH = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, updateClientSchema);
  if (error) return error;
  const client = await updateClient(session.user.companyId, params.id, data);
  return NextResponse.json(client);
});
