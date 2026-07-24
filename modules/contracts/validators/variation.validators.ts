import { z } from "zod";

export const createVariationSchema = z.object({
  variationNumber: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  costImpact: z.number().optional(),
  timeImpactDays: z.number().int().optional(),
});

export const decideVariationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});
