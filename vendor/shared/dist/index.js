"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceStatus = exports.TaskStatus = exports.DrawingStatus = exports.AttendanceStatus = exports.PipelineStage = exports.ProjectStatus = exports.ADMIN_ROLES = exports.UserRole = void 0;
exports.haversineDistanceMeters = haversineDistanceMeters;
var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "OWNER";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["HR"] = "HR";
    UserRole["ARCHITECT"] = "ARCHITECT";
    UserRole["SITE_ENGINEER"] = "SITE_ENGINEER";
    UserRole["DRAFTING_ENGINEER"] = "DRAFTING_ENGINEER";
    UserRole["INTERIOR_DESIGNER"] = "INTERIOR_DESIGNER";
    UserRole["PROJECT_ENGINEER"] = "PROJECT_ENGINEER";
    UserRole["ACCOUNTANT"] = "ACCOUNTANT";
    UserRole["QC_ENGINEER"] = "QC_ENGINEER";
    UserRole["CLIENT"] = "CLIENT";
    UserRole["EMPLOYEE"] = "EMPLOYEE";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.ADMIN_ROLES = [UserRole.OWNER, UserRole.SUPER_ADMIN];
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["LEAD"] = "LEAD";
    ProjectStatus["PLANNING"] = "PLANNING";
    ProjectStatus["ACTIVE"] = "ACTIVE";
    ProjectStatus["DELAYED"] = "DELAYED";
    ProjectStatus["ON_HOLD"] = "ON_HOLD";
    ProjectStatus["COMPLETED"] = "COMPLETED";
    ProjectStatus["HANDED_OVER"] = "HANDED_OVER";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var PipelineStage;
(function (PipelineStage) {
    PipelineStage["LEAD"] = "LEAD";
    PipelineStage["SITE_VISIT"] = "SITE_VISIT";
    PipelineStage["PROPOSAL"] = "PROPOSAL";
    PipelineStage["QUOTATION"] = "QUOTATION";
    PipelineStage["NEGOTIATION"] = "NEGOTIATION";
    PipelineStage["WON"] = "WON";
    PipelineStage["LOST"] = "LOST";
})(PipelineStage || (exports.PipelineStage = PipelineStage = {}));
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["CLOCKED_IN"] = "CLOCKED_IN";
    AttendanceStatus["CLOCKED_OUT"] = "CLOCKED_OUT";
    AttendanceStatus["OUTSIDE_GEOFENCE"] = "OUTSIDE_GEOFENCE";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
var DrawingStatus;
(function (DrawingStatus) {
    DrawingStatus["DRAFT"] = "DRAFT";
    DrawingStatus["IN_REVIEW"] = "IN_REVIEW";
    DrawingStatus["APPROVED"] = "APPROVED";
    DrawingStatus["REJECTED"] = "REJECTED";
    DrawingStatus["SUPERSEDED"] = "SUPERSEDED";
})(DrawingStatus || (exports.DrawingStatus = DrawingStatus = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "TODO";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["IN_REVIEW"] = "IN_REVIEW";
    TaskStatus["DONE"] = "DONE";
    TaskStatus["BLOCKED"] = "BLOCKED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["SENT"] = "SENT";
    InvoiceStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["OVERDUE"] = "OVERDUE";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
/** Great-circle distance between two lat/lng points, in meters. */
function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
