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

const VARIATION_STATUS_VARIANT: Record<string, StatusVariant> = {
  DRAFT: "neutral",
  SUBMITTED: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

const INCIDENT_SEVERITY_VARIANT: Record<string, StatusVariant> = {
  NEAR_MISS: "neutral",
  MINOR: "info",
  MODERATE: "warning",
  MAJOR: "danger",
  FATALITY: "danger",
};

const INCIDENT_STATUS_VARIANT: Record<string, StatusVariant> = {
  OPEN: "danger",
  INVESTIGATING: "warning",
  CLOSED: "success",
};

const NCR_STATUS_VARIANT: Record<string, StatusVariant> = {
  OPEN: "danger",
  UNDER_REVIEW: "warning",
  CLOSED: "success",
};

const PO_STATUS_VARIANT: Record<string, StatusVariant> = {
  DRAFT: "neutral",
  ISSUED: "primary",
  PARTIALLY_INVOICED: "warning",
  CLOSED: "success",
  CANCELLED: "danger",
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

export function variationStatusVariant(status: string): StatusVariant {
  return VARIATION_STATUS_VARIANT[status] ?? "neutral";
}

export function incidentSeverityVariant(severity: string): StatusVariant {
  return INCIDENT_SEVERITY_VARIANT[severity] ?? "neutral";
}

export function incidentStatusVariant(status: string): StatusVariant {
  return INCIDENT_STATUS_VARIANT[status] ?? "neutral";
}

export function ncrStatusVariant(status: string): StatusVariant {
  return NCR_STATUS_VARIANT[status] ?? "neutral";
}

export function poStatusVariant(status: string): StatusVariant {
  return PO_STATUS_VARIANT[status] ?? "neutral";
}

export function formatStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
