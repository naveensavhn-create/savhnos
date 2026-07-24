import { z } from "zod";
import { DrawingStatus } from "@/lib/enums";

export const createDrawingSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  discipline: z.string().optional(),
});

export const uploadRevisionSchema = z.object({
  versionLabel: z.string().min(1),
  fileUrl: z.string().min(1),
  fileType: z.string().optional(),
});

export const reviewRevisionSchema = z.object({
  decision: z.nativeEnum(DrawingStatus),
  comments: z.string().optional(),
});
