import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@savhnos/shared";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
