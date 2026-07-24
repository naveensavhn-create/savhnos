import { NextResponse } from "next/server";
import { withAuth } from "@/server/permissions/with-auth";
import { parseBody } from "@/server/validators/parse-body";
import { updateGeofenceSchema } from "@/modules/projects/validators/project.validators";
import { upsertGeofence } from "@/server/services/project.service";
import { UserRole } from "@/lib/enums";

const MANAGE_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.PROJECT_ENGINEER];

export const PUT = withAuth(async (req, { session, params }) => {
  const { data, error } = await parseBody(req, updateGeofenceSchema);
  if (error) return error;
  const geofence = await upsertGeofence(session.user.companyId, params.id, data);
  return NextResponse.json(geofence);
}, MANAGE_ROLES);
