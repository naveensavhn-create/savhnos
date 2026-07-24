"use client";

import { useEffect, useState } from "react";
import { FolderKanban, MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { employmentStatusVariant, formatStatusLabel } from "@/lib/status";

interface EmployeeDetail {
  id: string;
  employeeCode: string;
  designation: string | null;
  department: string | null;
  status: string;
  phone: string | null;
  dateOfJoining: string | null;
  user: { name: string; email: string; role: string; isActive: boolean };
  branch: { name: string } | null;
  attendances: { id: string; clockInAt: string; clockOutAt: string | null; withinGeofence: boolean }[];
  projectAssignments: { id: string; roleOnSite: string | null; project: { name: string; code: string } }[];
}

export function EmployeeDetailDialog({
  employeeId,
  onOpenChange,
}: {
  employeeId: string | null;
  onOpenChange: (id: string | null) => void;
}) {
  const [detail, setDetail] = useState<EmployeeDetail | null>(null);

  useEffect(() => {
    if (!employeeId) {
      setDetail(null);
      return;
    }
    apiFetch<EmployeeDetail>(`/employees/${employeeId}`).then(setDetail).catch(() => {});
  }, [employeeId]);

  return (
    <Dialog open={!!employeeId} onOpenChange={(open) => !open && onOpenChange(null)}>
      <DialogContent className="max-w-lg">
        {!detail ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar name={detail.user.name} size="lg" />
                <div>
                  <DialogTitle>{detail.user.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {detail.designation ?? formatStatusLabel(detail.user.role)} · {detail.employeeCode}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Badge variant={employmentStatusVariant(detail.status)} dot>
                {formatStatusLabel(detail.status)}
              </Badge>
              <Badge variant="outline">{formatStatusLabel(detail.user.role)}</Badge>
              {detail.department && <Badge variant="neutral">{detail.department}</Badge>}
              {detail.branch && <Badge variant="neutral">{detail.branch.name}</Badge>}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current projects
              </p>
              {detail.projectAssignments.length === 0 ? (
                <EmptyState icon={FolderKanban} title="Not assigned to a project" className="py-6" />
              ) : (
                <ul className="space-y-1.5">
                  {detail.projectAssignments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                      <span className="font-medium">{a.project.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{a.project.code}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recent attendance
              </p>
              {detail.attendances.length === 0 ? (
                <EmptyState icon={MapPin} title="No attendance recorded yet" className="py-6" />
              ) : (
                <ul className="max-h-48 space-y-1.5 overflow-y-auto">
                  {detail.attendances.slice(0, 8).map((a) => (
                    <li key={a.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{new Date(a.clockInAt).toLocaleString()}</span>
                      <Badge variant={a.withinGeofence ? "success" : "danger"} className="text-[10px]">
                        {a.withinGeofence ? "On site" : "Outside geofence"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
