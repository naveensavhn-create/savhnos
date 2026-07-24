"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClipboardX, Plus } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { formatStatusLabel, ncrStatusVariant } from "@/lib/status";
import { NCRDisposition, NCRStatus } from "@/lib/enums";

interface Project {
  id: string;
  name: string;
  code: string;
}
interface NCR {
  id: string;
  title: string;
  description: string | null;
  status: string;
  disposition: string | null;
  closureEvidence: string | null;
  createdAt: string;
  project: { name: string; code: string };
  raisedBy: { name: string } | null;
}

export default function QualityPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ncrs, setNcrs] = useState<NCR[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [active, setActive] = useState<NCR | null>(null);

  useEffect(() => {
    apiFetch<Project[]>("/projects").then(setProjects);
  }, []);

  const load = () => {
    setLoading(true);
    apiFetch<NCR[]>("/ncrs")
      .then(setNcrs)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quality (NCR)</h1>
          <p className="text-sm text-muted-foreground">Non-conformance reports with disposition and closure evidence.</p>
        </div>
        <Button onClick={() => setNewOpen(true)} disabled={projects.length === 0} className="gap-1.5">
          <Plus className="h-4 w-4" /> Raise NCR
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !ncrs || ncrs.length === 0 ? (
        <EmptyState
          icon={ClipboardX}
          title="No non-conformances raised"
          description="Quality issues found on site or during inspection will appear here."
          action={
            <Button onClick={() => setNewOpen(true)} disabled={projects.length === 0}>
              Raise NCR
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {ncrs.map((n) => (
            <Card key={n.id} className="cursor-pointer p-5 transition-shadow hover:shadow-popover" onClick={() => setActive(n)}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.project.code} · {n.project.name}
                    {n.raisedBy && ` · raised by ${n.raisedBy.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {n.disposition && <Badge variant="outline">{formatStatusLabel(n.disposition)}</Badge>}
                  <Badge variant={ncrStatusVariant(n.status)} dot>
                    {formatStatusLabel(n.status)}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <NewNCRDialog projects={projects} open={newOpen} onOpenChange={setNewOpen} onCreated={load} />

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-lg">
          {active && <NCRDetailPanel ncr={active} onUpdated={() => { load(); setActive(null); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewNCRDialog({
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
  const [form, setForm] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && !projectId) setProjectId(projects[0].id);
  }, [projects, projectId]);

  const submit = async () => {
    if (!form.title || !projectId) return;
    setSubmitting(true);
    try {
      await apiFetch(`/projects/${projectId}/ncrs`, { method: "POST", body: JSON.stringify(form) });
      toast.success("NCR raised");
      setForm({ title: "", description: "" });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to raise NCR");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise a non-conformance</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <NativeSelect value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </NativeSelect>
          <Input placeholder="What's non-conforming?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button onClick={submit} loading={submitting} disabled={!form.title || !projectId}>
            Raise NCR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NCRDetailPanel({ ncr, onUpdated }: { ncr: NCR; onUpdated: () => void }) {
  const [status, setStatus] = useState<NCRStatus>(ncr.status as NCRStatus);
  const [disposition, setDisposition] = useState<NCRDisposition | "">((ncr.disposition as NCRDisposition) ?? "");
  const [closureEvidence, setClosureEvidence] = useState(ncr.closureEvidence ?? "");
  const [submitting, setSubmitting] = useState(false);

  const save = async () => {
    setSubmitting(true);
    try {
      await apiFetch(`/ncrs/${ncr.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          disposition: disposition || undefined,
          closureEvidence: closureEvidence || undefined,
        }),
      });
      toast.success("NCR updated");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "You may not have permission to update this NCR");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{ncr.title}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {ncr.project.code} · {ncr.project.name}
          {ncr.raisedBy && ` · raised by ${ncr.raisedBy.name}`}
        </p>
        {ncr.description && <p className="text-sm">{ncr.description}</p>}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
          <NativeSelect value={status} onChange={(e) => setStatus(e.target.value as NCRStatus)}>
            {Object.values(NCRStatus).map((s) => (
              <option key={s} value={s}>
                {formatStatusLabel(s)}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Disposition</label>
          <NativeSelect value={disposition} onChange={(e) => setDisposition(e.target.value as NCRDisposition)}>
            <option value="">Not decided</option>
            {Object.values(NCRDisposition).map((d) => (
              <option key={d} value={d}>
                {formatStatusLabel(d)}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Closure evidence</label>
          <Textarea value={closureEvidence} onChange={(e) => setClosureEvidence(e.target.value)} />
        </div>
        <Button onClick={save} loading={submitting}>
          Save
        </Button>
      </div>
    </>
  );
}
