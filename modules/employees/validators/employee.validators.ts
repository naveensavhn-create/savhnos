import { z } from "zod";
import { UserRole } from "@/lib/enums";

/** Internal staff roles only — CLIENT is a portal role linked via Client.portalUserId, not an Employee record. */
export const STAFF_ROLES = Object.values(UserRole).filter((r) => r !== UserRole.CLIENT);

export const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z
    .nativeEnum(UserRole)
    .refine((r) => r !== UserRole.CLIENT, {
      message: "Clients cannot be added as employees — use the Clients & CRM module instead.",
    }),
  employeeCode: z.string().min(1),
  designation: z.string().optional(),
  department: z.string().optional(),
  branchId: z.string().optional(),
  phone: z.string().optional(),
  dateOfJoining: z.string().optional(),
  monthlySalary: z.number().optional(),
});
