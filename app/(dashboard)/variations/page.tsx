"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileSignature, Plus, Check, X, Clock } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input, NativeSelect } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { formatStatusLabel, variationStatusVariant } from "@/lib/status";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

interface Project {
  id: string;
  name: string;
  code: string;
}
interface Variation {
  id: string;
  variationNumber: string;
  title: string;
  description: string | null;
  costImpact: string | number | null;
  timeImpactDays: number | null;
  status: string;
  requestedBy: { name: string; email: string } | null;
  createdAt: string;
}

export default function VariationsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    apiFetch<Project[]>("/projects").then((ps) => {
      setProjects(ps);
      if (ps.length > 0) setProjectId(ps[0].id);
    });
  }, []);

  const load = (pid: string) => {
    setLoading(true);
    apiFetch<Variation[]>(`/projects/${pid}/variations`)
      .then(setVariations)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (projectId) load(projectId);
  }, [projectId]);

  const decide = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await apiFetch(`/variations/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast.success(status === "APPROVED" ? "Variation approved" : "Variation rejected");
      load(projectId);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "You may not have permission to decide variations");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Variations</h1>
          <p className="text-sm text-muted-foreground">
            Change order lifecycle — origin to client decision. The broader contract admin
            surface (EOT, claims, notice deadlines, bank guarantees) is still roadmap.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NativeSelect value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-56">
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </NativeSelect>
          <Button onClick={() => setNewOpen(true)} disabled={!projectId} className="gap-1.5">
            <Plus className="h-4 w-4" /> New variation
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : variations.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="No variations yet"
          description="Raise a change order when scope, cost or time shifts from the contract."
          action={
            <Button onClick={() => setNewOpen(true)} disabled={!projectId}>
              New variation
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {variations.map((v) => (
            <Card key={v.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {v.variationNumber} · {v.title}
                  </p>
                  {v.requestedBy && <p className="text-xs text-muted-foreground">Requested by {v.requestedBy.name}</p>}
                </div>
                <Badge variant={variationStatusVariant(v.status)}>{formatStatusLabel(v.status)}</Badge>
              </div>
              {v.description && <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {v.costImpact != null && <span>Cost impact: {currency.format(Number(v.costImpact))}</span>}
                {v.timeImpactDays != null && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {v.timeImpactDays} day{v.timeImpactDays === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              {v.status === "SUBMITTED" && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="success" className="flex-1 gap-1.5" onClick={() => decide(v.id, "APPROVED")}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="danger" className="flex-1 gap-1.5" onClick={() => decide(v.id, "REJECTED")}>
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <NewVariationDialog projectId={projectId} open={newOpen} onOpenChange={setNewOpen} onCreated={() => load(projectId)} />
    </div>
  );
}

function NewVariationDialog({
  projectId,
  open,
  onOpenChange,
  onCreated,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ variationNumber: "", title: "", description: "", costImpact: "", timeImpactDays: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!form.variationNumber || !form.title) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/projects/${projectId}/variations`, {
        method: "POST",
        body: JSON.stringify({
          variationNumber: form.variationNumber,
          title: form.title,
          description: form.description || undefined,
          costImpact: form.costImpact ? Number(form.costImpact) : undefined,
          timeImpactDays: form.timeImpactDays ? Number(form.timeImpactDays) : undefined,
        }),
      });
      toast.success("Variation submitted");
      setForm({ variationNumber: "", title: "", description: "", costImpact: "", timeImpactDays: "" });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create variation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New variation</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input placeholder="Variation number (e.g. VO-004)" value={form.variationNumber} onChange={(e) => setForm({ ...form, variationNumber: e.target.value })} />
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Cost impact (INR)" value={form.costImpact} onChange={(e) => setForm({ ...form, costImpact: e.target.value })} />
            <Input type="number" placeholder="Time impact (days)" value={form.timeImpactDays} onChange={(e) => setForm({ ...form, timeImpactDays: e.target.value })} />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button onClick={submit} loading={submitting} disabled={!form.variationNumber || !form.title}>
            Submit variation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
