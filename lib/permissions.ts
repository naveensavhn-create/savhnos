import { UserRole } from "@/lib/enums";

/**
 * Client-safe mirror of the role lists enforced server-side in the
 * corresponding Route Handlers. Used to skip requests the current user's
 * role can never succeed at (avoiding pointless 403s and console noise on
 * every page load), not as the actual authorization boundary — the API
 * routes still enforce these independently.
 */
export const ATTENDANCE_VIEW_ROLES: UserRole[] = [
  UserRole.OWNER,
  UserRole.SUPER_ADMIN,
  UserRole.HR,
  UserRole.PROJECT_ENGINEER,
];

export function canViewCompanyAttendance(role: UserRole | undefined): boolean {
  return !!role && ATTENDANCE_VIEW_ROLES.includes(role);
}
