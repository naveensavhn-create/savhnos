import { z } from "zod";
import { ProjectStatus } from "@/lib/enums";

export const createProjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  status: z.nativeEnum(ProjectStatus).optional(),
  clientId: z.string().optional(),
  budget: z.number().optional(),
  startDate: z.string().optional(),
  targetEndDate: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusMeters: z.number().optional(),
  softToleranceMeters: z.number().optional(),
});

export const updateGeofenceSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().optional(),
  softToleranceMeters: z.number().optional(),
});

export const assignEmployeeSchema = z.object({
  employeeId: z.string().min(1),
  roleOnSite: z.string().optional(),
});
