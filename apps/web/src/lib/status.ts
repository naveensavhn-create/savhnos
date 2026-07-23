export type StatusColor = "gray" | "blue" | "orange" | "red";

const PROJECT_STATUS_COLOR: Record<string, StatusColor> = {
  LEAD: "gray",
  PLANNING: "orange",
  ACTIVE: "blue",
  DELAYED: "red",
  ON_HOLD: "orange",
  COMPLETED: "gray",
  HANDED_OVER: "gray",
};

const DRAWING_STATUS_COLOR: Record<string, StatusColor> = {
  DRAFT: "gray",
  IN_REVIEW: "orange",
  APPROVED: "blue",
  REJECTED: "red",
  SUPERSEDED: "gray",
};

const PIPELINE_STAGE_COLOR: Record<string, StatusColor> = {
  LEAD: "gray",
  SITE_VISIT: "orange",
  PROPOSAL: "orange",
  QUOTATION: "orange",
  NEGOTIATION: "orange",
  WON: "blue",
  LOST: "red",
};

const EMPLOYMENT_STATUS_COLOR: Record<string, StatusColor> = {
  ACTIVE: "blue",
  ON_LEAVE: "orange",
  SUSPENDED: "red",
  EXITED: "gray",
};

export function projectStatusColor(status: string): StatusColor {
  return PROJECT_STATUS_COLOR[status] ?? "gray";
}

export function drawingStatusColor(status: string): StatusColor {
  return DRAWING_STATUS_COLOR[status] ?? "gray";
}

export function pipelineStageColor(stage: string): StatusColor {
  return PIPELINE_STAGE_COLOR[stage] ?? "gray";
}

export function employmentStatusColor(status: string): StatusColor {
  return EMPLOYMENT_STATUS_COLOR[status] ?? "gray";
}

export function formatStatusLabel(status: string): string {
  return status.replaceAll("_", " ");
}
