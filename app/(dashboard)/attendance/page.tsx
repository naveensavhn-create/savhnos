"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { LogIn, LogOut, MapPin, Radar, Clock, Navigation } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { canViewCompanyAttendance } from "@/lib/permissions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { NativeSelect } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";

interface Project {
  id: string;
  name: string;
  code: string;
}
interface AttendanceRecord {
  id: string;
  clockInAt: string;
  clockOutAt: string | null;
  withinGeofence: boolean;
  distanceMeters: number | null;
  project: { name: string; code: string } | null;
  employee?: { user: { name: string } };
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
  });
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [today, setToday] = useState<AttendanceRecord[] | null>(null);
  const [busy, setBusy] = useState(false);

  const loadHistory = () => apiFetch<AttendanceRecord[]>("/attendance/me").then(setHistory).catch(() => {});
  const loadToday = () => {
    if (!canViewCompanyAttendance(user?.role)) return;
    apiFetch<AttendanceRecord[]>("/attendance/today")
      .then(setToday)
      .catch(() => setToday(null));
  };

  useEffect(() => {
    apiFetch<Project[]>("/projects").then(setProjects).catch(() => {});
    loadHistory();
    loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const clockIn = async () => {
    setBusy(true);
    try {
      const position = await getCurrentPosition();
      await apiFetch("/attendance/clock-in", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectId || undefined,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });
      toast.success("Clocked in successfully");
      loadHistory();
      loadToday();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const clockOut = async () => {
    setBusy(true);
    try {
      const position = await getCurrentPosition();
      await apiFetch("/attendance/clock-out", {
        method: "POST",
        body: JSON.stringify({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      });
      toast.success("Clocked out successfully");
      loadHistory();
      loadToday();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onSite = today?.filter((a) => !a.clockOutAt).length ?? 0;
  const outsideGeofence = today?.filter((a) => !a.withinGeofence).length ?? 0;

  const columns: ColumnDef<AttendanceRecord>[] = [
    { id: "date", header: "Clock in", accessorFn: (r) => new Date(r.clockInAt).toLocaleString() },
    {
      id: "out",
      header: "Clock out",
      accessorFn: (r) => (r.clockOutAt ? new Date(r.clockOutAt).toLocaleString() : "—"),
    },
    { id: "project", header: "Project", accessorFn: (r) => (r.project ? `${r.project.code} · ${r.project.name}` : "Office") },
    {
      id: "geofence",
      header: "Geofence",
      cell: ({ row }) => (
        <Badge variant={row.original.withinGeofence ? "success" : "danger"} dot>
          {row.original.withinGeofence ? "Within geofence" : "Outside geofence"}
          {row.original.distanceMeters != null ? ` · ${Math.round(row.original.distanceMeters)}m` : ""}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground">Geofenced clock-in/out for field and office teams.</p>
      </div>

      {today && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Clocked in today" value={today.length} icon={Clock} accent="neutral" />
          <StatCard label="Currently on site" value={onSite} icon={Radar} accent="primary" />
          <StatCard label="Outside geofence" value={outsideGeofence} icon={Navigation} accent="danger" />
          <StatCard label="Clocked out" value={today.length - onSite} icon={LogOut} accent="neutral" />
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <p className="mb-4 text-sm text-muted-foreground">
            Clock in from a project site to trigger a geofence check. Leave the project unselected for office attendance.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <NativeSelect value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-64">
              <option value="">Office (no geofence)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </NativeSelect>
            <Button onClick={clockIn} loading={busy} className="gap-1.5">
              <LogIn className="h-4 w-4" /> Clock in
            </Button>
            <Button onClick={clockOut} loading={busy} variant="outline" className="gap-1.5">
              <LogOut className="h-4 w-4" /> Clock out
            </Button>
          </div>
        </CardContent>
      </Card>

      {today && (
        <Card>
          <CardHeader>
            <CardTitle>Live roster — who&apos;s working today</CardTitle>
          </CardHeader>
          <CardContent>
            {today.length === 0 ? (
              <EmptyState icon={MapPin} title="No one has clocked in yet" className="py-8" />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {today.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <Avatar name={a.employee?.user.name ?? "?"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.employee?.user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.project ? a.project.code : "Office"}</p>
                    </div>
                    <Badge variant={a.clockOutAt ? "neutral" : "success"} dot className="text-[10px]">
                      {a.clockOutAt ? "Done" : "On site"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">My history</h2>
        <DataTable
          columns={columns}
          data={history}
          searchPlaceholder="Search attendance…"
          emptyState={<EmptyState icon={MapPin} title="No attendance records yet" />}
        />
      </div>
    </div>
  );
}
