import { z } from "zod";
import { UserRole } from "@/lib/enums";

export const inviteUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z
    .nativeEnum(UserRole)
    .refine((r) => r !== UserRole.CLIENT, {
      message: "Clients cannot be invited as team members — use the Clients & CRM module instead.",
    }),
});
