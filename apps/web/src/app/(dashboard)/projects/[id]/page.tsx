"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Wallet,
  CalendarRange,
  Users,
  UserPlus,
  Crosshair,
  ListChecks,
  Ruler,
  Camera,
  CloudSun,
  StickyNote,
  ArrowRight,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, NativeSelect } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatStatusLabel, projectStatusVariant, taskStatusVariant } from "@/lib/status";

interface Employee {
  id: string;
  employeeCode: string;
  user: { name: string };
}

interface ProjectDetail {
  id: string;
  name: string;
  code: string;
  status: string;
  budget: string | null;
  startDate: string | null;
  targetEndDate: string | null;
  address: string | null;
  client: { name: string; email: string | null } | null;
  geofence: { latitude: number; longitude: number; radiusMeters: number; softToleranceMeters: number } | null;
  assignments: { id: string; roleOnSite: string | null; employee: { employeeCode: string; user: { name: string; role: string } } }[];
  tasks: { id: string; title: string; status: string; priority: string; dueDate: string | null }[];
}

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [geofenceOpen, setGeofenceOpen] = useState(false);

  const load = () => {
    apiFetch<ProjectDetail>(`/projects/${params.id}`)
      .then(setProject)
      .catch(() => setNotFound(true));
  };

  useEffect(load, [params.id]);

  if (notFound) {
    return (
      <EmptyState
        icon={MapPin}
        title="Project not found"
        description="It may have been removed, or you don't have access."
        action={
          <Link href="/projects">
            <Button variant="outline" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to projects
            </Button>
          </Link>
        }
      />
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
  const completion = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : null;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/projects" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Projects
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                <Badge variant={projectStatusVariant(project.status)} dot>
                  {formatStatusLabel(project.status)}
                </Badge>
              </div>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{project.code}</p>
            </div>
            {completion !== null && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-medium text-muted-foreground">Task completion</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
                  </div>
                  <span className="text-sm font-semibold">{completion}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
            <Fact icon={Wallet} label="Budget" value={project.budget ? currency.format(Number(project.budget)) : "—"} />
            <Fact icon={Users} label="Client" value={project.client?.name ?? "—"} />
            <Fact icon={MapPin} label="Location" value={project.address ?? "—"} />
            <Fact
              icon={CalendarRange}
              label="Timeline"
              value={
                project.startDate
                  ? `${new Date(project.startDate).toLocaleDateString()} → ${
                      project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : "TBD"
                    }`
                  : "—"
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="team">Team ({project.assignments.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({project.tasks.length})</TabsTrigger>
              <TabsTrigger value="drawings">Drawings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Geofence</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.geofence ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Fact icon={Crosshair} label="Latitude" value={project.geofence.latitude.toFixed(5)} />
                      <Fact icon={Crosshair} label="Longitude" value={project.geofence.longitude.toFixed(5)} />
                      <Fact icon={MapPin} label="Hard radius" value={`${project.geofence.radiusMeters}m`} />
                      <Fact icon={MapPin} label="Soft tolerance" value={`+${project.geofence.softToleranceMeters}m`} />
                    </div>
                  ) : (
                    <EmptyState
                      icon={MapPin}
                      title="No geofence configured"
                      description="Field employees can't clock in until a geofence is set."
                      action={
                        <Button size="sm" onClick={() => setGeofenceOpen(true)}>
                          Set geofence
                        </Button>
                      }
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle>Assigned team</CardTitle>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAssignOpen(true)}>
                    <UserPlus className="h-3.5 w-3.5" /> Assign
                  </Button>
                </CardHeader>
                <CardContent>
                  {project.assignments.length === 0 ? (
                    <EmptyState icon={Users} title="No one assigned yet" description="Assign employees so they can clock in on site." />
                  ) : (
                    <ul className="divide-y divide-border">
                      {project.assignments.map((a) => (
                        <li key={a.id} className="flex items-center gap-3 py-2.5">
                          <Avatar name={a.employee.user.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{a.employee.user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {a.roleOnSite ?? formatStatusLabel(a.employee.user.role)}
                            </p>
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">{a.employee.employeeCode}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.tasks.length === 0 ? (
                    <EmptyState icon={ListChecks} title="No tasks yet" />
                  ) : (
                    <ul className="divide-y divide-border">
                      {project.tasks.map((t) => (
                        <li key={t.id} className="flex items-center gap-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{t.title}</p>
                            {t.dueDate && (
                              <p className="text-xs text-muted-foreground">Due {new Date(t.dueDate).toLocaleDateString()}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {t.priority.toLowerCase()}
                          </Badge>
                          <Badge variant={taskStatusVariant(t.status)} dot>
                            {formatStatusLabel(t.status)}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drawings">
              <Card>
                <CardContent className="p-6">
                  <EmptyState
                    icon={Ruler}
                    title="Open in Drawing Management"
                    description="View revisions, approvals and version history for this project."
                    action={
                      <Link href={`/drawings?projectId=${project.id}`}>
                        <Button size="sm" className="gap-1.5">
                          Open drawings <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start gap-2" onClick={() => setAssignOpen(true)}>
                <UserPlus className="h-4 w-4" /> Assign team member
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => setGeofenceOpen(true)}>
                <Crosshair className="h-4 w-4" /> Update geofence
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Site photos</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState icon={Camera} title="Coming soon" description="Photo uploads need object storage wired up." className="py-8" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState icon={StickyNote} title="Coming soon" description="Project notes aren't wired to the backend yet." className="py-8" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weather</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState icon={CloudSun} title="Coming soon" description="Needs a weather API key." className="py-8" />
            </CardContent>
          </Card>
        </div>
      </div>

      <AssignDialog projectId={project.id} open={assignOpen} onOpenChange={setAssignOpen} onAssigned={load} />
      <GeofenceDialog
        projectId={project.id}
        initial={project.geofence}
        open={geofenceOpen}
        onOpenChange={setGeofenceOpen}
        onSaved={load}
      />
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function AssignDialog({
  projectId,
  open,
  onOpenChange,
  onAssigned,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [roleOnSite, setRoleOnSite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) apiFetch<Employee[]>("/employees").then(setEmployees).catch(() => {});
  }, [open]);

  const submit = async () => {
    if (!employeeId) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/projects/${projectId}/assign`, {
        method: "POST",
        body: JSON.stringify({ employeeId, roleOnSite: roleOnSite || undefined }),
      });
      toast.success("Team member assigned");
      onOpenChange(false);
      onAssigned();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to assign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign team member</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <NativeSelect value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">Select employee…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.user.name} ({e.employeeCode})
              </option>
            ))}
          </NativeSelect>
          <Input placeholder="Role on site (optional)" value={roleOnSite} onChange={(e) => setRoleOnSite(e.target.value)} />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button onClick={submit} loading={submitting} disabled={!employeeId}>
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GeofenceDialog({
  projectId,
  initial,
  open,
  onOpenChange,
  onSaved,
}: {
  projectId: string;
  initial: ProjectDetail["geofence"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    latitude: initial?.latitude?.toString() ?? "",
    longitude: initial?.longitude?.toString() ?? "",
    radiusMeters: initial?.radiusMeters?.toString() ?? "150",
    softToleranceMeters: initial?.softToleranceMeters?.toString() ?? "100",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      latitude: initial?.latitude?.toString() ?? "",
      longitude: initial?.longitude?.toString() ?? "",
      radiusMeters: initial?.radiusMeters?.toString() ?? "150",
      softToleranceMeters: initial?.softToleranceMeters?.toString() ?? "100",
    });
  }, [initial, open]);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/projects/${projectId}/geofence`, {
        method: "PUT",
        body: JSON.stringify({
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          radiusMeters: Number(form.radiusMeters),
          softToleranceMeters: Number(form.softToleranceMeters),
        }),
      });
      toast.success("Geofence updated");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update geofence");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update geofence</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
          <Input placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          <Input placeholder="Hard radius (m)" value={form.radiusMeters} onChange={(e) => setForm({ ...form, radiusMeters: e.target.value })} />
          <Input
            placeholder="Soft tolerance (m)"
            value={form.softToleranceMeters}
            onChange={(e) => setForm({ ...form, softToleranceMeters: e.target.value })}
          />
          {error && <p className="col-span-2 text-sm text-danger">{error}</p>}
          <Button onClick={submit} loading={submitting} className="col-span-2">
            Save geofence
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
