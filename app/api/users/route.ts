import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { inviteUserSchema } from "@/modules/settings/validators/user.validators";
import { inviteUser, listUsers } from "@/server/services/user.service";
import { UserRole } from "@/lib/enums";

export const GET = withAuth(async (_req, { session }) => {
  const users = await listUsers(session.user.companyId);
  return NextResponse.json(users);
});

export const POST = withAuth(
  async (req, { session }) => {
    const { data, error } = await parseBody(req, inviteUserSchema);
    if (error) return error;
    const user = await inviteUser(session.user.companyId, data);
    return NextResponse.json(user, { status: 201 });
  },
  [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.HR]
);
