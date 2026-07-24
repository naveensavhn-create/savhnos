import { z } from "zod";
import { NCRDisposition, NCRStatus } from "@/lib/enums";

export const createNCRSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export const updateNCRSchema = z.object({
  status: z.nativeEnum(NCRStatus).optional(),
  disposition: z.nativeEnum(NCRDisposition).optional(),
  closureEvidence: z.string().optional(),
});
