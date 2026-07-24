import { z } from "zod";
import { PipelineStage } from "@/lib/enums";

export const createClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  pipelineStage: z.nativeEnum(PipelineStage).optional(),
  estimatedValue: z.number().optional(),
});

export const updateClientSchema = createClientSchema.partial();
