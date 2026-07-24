/**
 * Re-exports Prisma's generated enums so the rest of the app imports enums
 * from one stable path (`@/lib/enums`) instead of `@prisma/client` directly.
 * Prisma generates these from `schema.prisma` — the database is the single
 * source of truth, nothing here is hand-duplicated.
 */
export {
  UserRole,
  EmploymentStatus,
  LeaveStatus,
  ProjectStatus,
  AttendanceMethod,
  PipelineStage,
  TaskStatus,
  TaskPriority,
  DrawingStatus,
  InvoiceStatus,
  ExpenseCategory,
  POStatus,
  VariationStatus,
  IncidentSeverity,
  IncidentStatus,
  NCRStatus,
  NCRDisposition,
} from "@prisma/client";

import { UserRole } from "@prisma/client";

export const ADMIN_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN] as const;
