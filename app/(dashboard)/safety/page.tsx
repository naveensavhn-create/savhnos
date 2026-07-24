"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, Plus, AlertTriangle } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { formatStatusLabel, incidentSeverityVariant, incidentStatusVariant } from "@/lib/status";
import { IncidentSeverity, IncidentStatus } from "@/lib/enums";

interface Project {
  id: string;
  name: string;
  code: string;
}
interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  occurredAt: string;
  rootCause: string | null;
  correctiveAction: string | null;
  project: { name: string; code: string };
  reportedBy: { name: string } | null;
}

export default function SafetyPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [active, setActive] = useState<Incident | null>(null);

  useEffect(() => {
    apiFetch<Project[]>("/projects").then(setProjects);
  }, []);

  const load = () => {
    setLoading(true);
    apiFetch<Incident[]>("/safety-incidents")
      .then(setIncidents)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Safety (EHS)</h1>
          <p className="text-sm text-muted-foreground">Incidents, near-misses and corrective action, across every project.</p>
        </div>
        <Button onClick={() => setNewOpen(true)} disabled={projects.length === 0} className="gap-1.5">
          <Plus className="h-4 w-4" /> Report incident
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !incidents || incidents.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No incidents recorded"
          description="Near-misses and incidents reported by any team member will appear here."
          action={
            <Button onClick={() => setNewOpen(true)} disabled={projects.length === 0}>
              Report incident
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {incidents.map((i) => (
            <Card key={i.id} className="cursor-pointer p-5 transition-shadow hover:shadow-popover" onClick={() => setActive(i)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{i.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.project.code} · {i.project.name}
                  </p>
                </div>
                <Badge variant={incidentSeverityVariant(i.severity)}>{formatStatusLabel(i.severity)}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{new Date(i.occurredAt).toLocaleDateString()}</span>
                <Badge variant={incidentStatusVariant(i.status)} dot>
                  {formatStatusLabel(i.status)}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <NewIncidentDialog projects={projects} open={newOpen} onOpenChange={setNewOpen} onCreated={load} />

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-lg">
          {active && <IncidentDetailPanel incident={active} onUpdated={() => { load(); setActive(null); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewIncidentDialog({
  projects,
  open,
  onOpenChange,
  onCreated,
}: {
  projects: Project[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [projectId, setProjectId] = useState("");
  const [form, setForm] = useState<{ title: string; description: string; severity: IncidentSeverity }>({
    title: "",
    description: "",
    severity: IncidentSeverity.NEAR_MISS,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && !projectId) setProjectId(projects[0].id);
  }, [projects, projectId]);

  const submit = async () => {
    if (!form.title || !projectId) return;
    setSubmitting(true);
    try {
      await apiFetch(`/projects/${projectId}/safety-incidents`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Incident reported");
      setForm({ title: "", description: "", severity: IncidentSeverity.NEAR_MISS });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to report incident");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a safety incident</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <NativeSelect value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </NativeSelect>
          <Input placeholder="What happened?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <NativeSelect value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as IncidentSeverity })}>
            {Object.values(IncidentSeverity).map((s) => (
              <option key={s} value={s}>
                {formatStatusLabel(s)}
              </option>
            ))}
          </NativeSelect>
          <Button onClick={submit} loading={submitting} disabled={!form.title || !projectId} className="gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Report incident
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IncidentDetailPanel({ incident, onUpdated }: { incident: Incident; onUpdated: () => void }) {
  const [status, setStatus] = useState<IncidentStatus>(incident.status as IncidentStatus);
  const [rootCause, setRootCause] = useState(incident.rootCause ?? "");
  const [correctiveAction, setCorrectiveAction] = useState(incident.correctiveAction ?? "");
  const [submitting, setSubmitting] = useState(false);

  const save = async () => {
    setSubmitting(true);
    try {
      await apiFetch(`/safety-incidents/${incident.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, rootCause: rootCause || undefined, correctiveAction: correctiveAction || undefined }),
      });
      toast.success("Incident updated");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "You may not have permission to update this incident");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{incident.title}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {incident.project.code} · {incident.project.name}
          {incident.reportedBy && ` · reported by ${incident.reportedBy.name}`}
        </p>
        {incident.description && <p className="text-sm">{incident.description}</p>}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
          <NativeSelect value={status} onChange={(e) => setStatus(e.target.value as IncidentStatus)}>
            {Object.values(IncidentStatus).map((s) => (
              <option key={s} value={s}>
                {formatStatusLabel(s)}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Root cause</label>
          <Textarea value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Corrective action</label>
          <Textarea value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)} />
        </div>
        <Button onClick={save} loading={submitting}>
          Save
        </Button>
      </div>
    </>
  );
}
