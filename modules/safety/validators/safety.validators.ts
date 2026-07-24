import { z } from "zod";
import { IncidentSeverity, IncidentStatus } from "@/lib/enums";

export const createSafetyIncidentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  severity: z.nativeEnum(IncidentSeverity),
  occurredAt: z.string().optional(),
});

export const updateSafetyIncidentSchema = z.object({
  status: z.nativeEnum(IncidentStatus).optional(),
  rootCause: z.string().optional(),
  correctiveAction: z.string().optional(),
});
