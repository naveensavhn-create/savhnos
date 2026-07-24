import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { createClientSchema } from "@/modules/clients/validators/client.validators";
import { createClient, listClients } from "@/server/services/client.service";

export const GET = withAuth(async (_req, { session }) => {
  const clients = await listClients(session.user.companyId);
  return NextResponse.json(clients);
});

export const POST = withAuth(async (req, { session }) => {
  const { data, error } = await parseBody(req, createClientSchema);
  if (error) return error;
  const client = await createClient(session.user.companyId, data);
  return NextResponse.json(client, { status: 201 });
});
