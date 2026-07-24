import { z } from "zod";
import { UserRole } from "@/lib/enums";

export const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
  employeeCode: z.string().min(1),
  designation: z.string().optional(),
  department: z.string().optional(),
  branchId: z.string().optional(),
  phone: z.string().optional(),
  dateOfJoining: z.string().optional(),
  monthlySalary: z.number().optional(),
});
