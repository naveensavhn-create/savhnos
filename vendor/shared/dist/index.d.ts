export declare enum UserRole {
    OWNER = "OWNER",
    SUPER_ADMIN = "SUPER_ADMIN",
    HR = "HR",
    ARCHITECT = "ARCHITECT",
    SITE_ENGINEER = "SITE_ENGINEER",
    DRAFTING_ENGINEER = "DRAFTING_ENGINEER",
    INTERIOR_DESIGNER = "INTERIOR_DESIGNER",
    PROJECT_ENGINEER = "PROJECT_ENGINEER",
    ACCOUNTANT = "ACCOUNTANT",
    QC_ENGINEER = "QC_ENGINEER",
    CLIENT = "CLIENT",
    EMPLOYEE = "EMPLOYEE"
}
export declare const ADMIN_ROLES: UserRole[];
export declare enum ProjectStatus {
    LEAD = "LEAD",
    PLANNING = "PLANNING",
    ACTIVE = "ACTIVE",
    DELAYED = "DELAYED",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    HANDED_OVER = "HANDED_OVER"
}
export declare enum PipelineStage {
    LEAD = "LEAD",
    SITE_VISIT = "SITE_VISIT",
    PROPOSAL = "PROPOSAL",
    QUOTATION = "QUOTATION",
    NEGOTIATION = "NEGOTIATION",
    WON = "WON",
    LOST = "LOST"
}
export declare enum AttendanceStatus {
    CLOCKED_IN = "CLOCKED_IN",
    CLOCKED_OUT = "CLOCKED_OUT",
    OUTSIDE_GEOFENCE = "OUTSIDE_GEOFENCE"
}
export declare enum DrawingStatus {
    DRAFT = "DRAFT",
    IN_REVIEW = "IN_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    SUPERSEDED = "SUPERSEDED"
}
export declare enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE",
    BLOCKED = "BLOCKED"
}
export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    PAID = "PAID",
    OVERDUE = "OVERDUE"
}
export interface JwtPayload {
    sub: string;
    email: string;
    companyId: string;
    role: UserRole;
}
/** Great-circle distance between two lat/lng points, in meters. */
export declare function haversineDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number;
