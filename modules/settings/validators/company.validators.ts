import { z } from "zod";

export const updateCompanySchema = z.object({
  name: z.string().optional(),
  logoUrl: z.string().optional(),
  gstNumber: z.string().optional(),
});

export const createBranchSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
});
