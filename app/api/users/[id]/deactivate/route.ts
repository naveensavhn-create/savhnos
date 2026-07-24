import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { setUserActive } from "@/server/services/user.service";
import { UserRole } from "@/lib/enums";

export const PATCH = withAuth(
  async (_req, { session, params }) => {
    const user = await setUserActive(session.user.companyId, params.id, false);
    return NextResponse.json(user);
  },
  [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.HR]
);
