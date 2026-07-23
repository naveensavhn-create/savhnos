export type StatusVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const PROJECT_STATUS_VARIANT: Record<string, StatusVariant> = {
  LEAD: "neutral",
  PLANNING: "warning",
  ACTIVE: "primary",
  DELAYED: "danger",
  ON_HOLD: "warning",
  COMPLETED: "success",
  HANDED_OVER: "neutral",
};

const DRAWING_STATUS_VARIANT: Record<string, StatusVariant> = {
  DRAFT: "neutral",
  IN_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  SUPERSEDED: "neutral",
};

const PIPELINE_STAGE_VARIANT: Record<string, StatusVariant> = {
  LEAD: "neutral",
  SITE_VISIT: "info",
  PROPOSAL: "info",
  QUOTATION: "warning",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "danger",
};

const EMPLOYMENT_STATUS_VARIANT: Record<string, StatusVariant> = {
  ACTIVE: "success",
  ON_LEAVE: "warning",
  SUSPENDED: "danger",
  EXITED: "neutral",
};

const TASK_STATUS_VARIANT: Record<string, StatusVariant> = {
  TODO: "neutral",
  IN_PROGRESS: "primary",
  IN_REVIEW: "warning",
  DONE: "success",
  BLOCKED: "danger",
};

export function projectStatusVariant(status: string): StatusVariant {
  return PROJECT_STATUS_VARIANT[status] ?? "neutral";
}

export function drawingStatusVariant(status: string): StatusVariant {
  return DRAWING_STATUS_VARIANT[status] ?? "neutral";
}

export function pipelineStageVariant(stage: string): StatusVariant {
  return PIPELINE_STAGE_VARIANT[stage] ?? "neutral";
}

export function employmentStatusVariant(status: string): StatusVariant {
  return EMPLOYMENT_STATUS_VARIANT[status] ?? "neutral";
}

export function taskStatusVariant(status: string): StatusVariant {
  return TASK_STATUS_VARIANT[status] ?? "neutral";
}

export function formatStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
