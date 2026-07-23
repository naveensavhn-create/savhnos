"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  LayoutGrid,
  List,
  Ruler,
  Search,
  FileStack,
  Check,
  X,
  UploadCloud,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useNewFlag } from "@/lib/use-new-flag";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input, NativeSelect } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SkeletonCard } from "@/components/ui/skeleton";
import { drawingStatusVariant, formatStatusLabel } from "@/lib/status";
import { cn } from "@/lib/cn";

interface Project {
  id: string;
  name: string;
  code: string;
}
interface DrawingRevision {
  id: string;
  versionLabel: string;
  fileUrl: string;
  status: string;
  createdAt: string;
}
interface Drawing {
  id: string;
  title: string;
  discipline: string | null;
  revisions: DrawingRevision[];
}

const DISCIPLINES = ["Architectural", "Structural", "Electrical", "MEP"];

export default function DrawingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [activeDrawing, setActiveDrawing] = useState<Drawing | null>(null);
  const openViaQuery = useNewFlag();

  useEffect(() => {
    apiFetch<Project[]>("/projects").then((ps) => {
      setProjects(ps);
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get("projectId");
      if (fromQuery && ps.some((p) => p.id === fromQuery)) setProjectId(fromQuery);
      else if (ps.length > 0) setProjectId(ps[0].id);
    });
  }, []);

  const loadDrawings = (pid: string) => {
    setLoading(true);
    apiFetch<Drawing[]>(`/drawings?projectId=${pid}`)
      .then(setDrawings)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (projectId) loadDrawings(projectId);
  }, [projectId]);

  useEffect(() => {
    if (openViaQuery) setNewOpen(true);
  }, [openViaQuery]);

  const filtered = useMemo(
    () =>
      drawings.filter(
        (d) =>
          d.title.toLowerCase().includes(search.toLowerCase()) &&
          (!discipline || d.discipline === discipline)
      ),
    [drawings, search, discipline]
  );

  const review = async (revisionId: string, decision: "APPROVED" | "REJECTED") => {
    try {
      await apiFetch(`/drawings/revisions/${revisionId}/review`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      toast.success(decision === "APPROVED" ? "Revision approved" : "Revision rejected");
      loadDrawings(projectId);
      setActiveDrawing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to review revision");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drawings</h1>
          <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${drawings.length} drawings in this project`}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NativeSelect value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-56">
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </NativeSelect>
          <div className="flex rounded-xl border border-border bg-muted/60 p-1">
            <button onClick={() => setView("grid")} className={cn("rounded-lg p-1.5", view === "grid" ? "bg-card shadow-soft" : "text-muted-foreground")}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView("list")} className={cn("rounded-lg p-1.5", view === "list" ? "bg-card shadow-soft" : "text-muted-foreground")}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setNewOpen(true)} disabled={!projectId} className="gap-1.5">
            <Plus className="h-4 w-4" /> New drawing
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search drawings…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setDiscipline(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              discipline === null ? "border-primary-300 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300" : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            All
          </button>
          {DISCIPLINES.map((d) => (
            <button
              key={d}
              onClick={() => setDiscipline(d)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                discipline === d ? "border-primary-300 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300" : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Ruler}
          title="No drawings found"
          description="Upload your first drawing revision for this project."
          action={
            <Button onClick={() => setNewOpen(true)} disabled={!projectId}>
              New drawing
            </Button>
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => {
            const latest = d.revisions[0];
            return (
              <Card key={d.id} className="cursor-pointer overflow-hidden transition-shadow hover:shadow-popover" onClick={() => setActiveDrawing(d)}>
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-primary-50 to-muted dark:from-primary-900/20">
                  <Ruler className="h-9 w-9 text-primary-400" strokeWidth={1.5} />
                </div>
                <CardContent className="p-4">
                  <p className="truncate font-semibold">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.discipline ?? "General"}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <FileStack className="h-3.5 w-3.5" /> {d.revisions.length} revision{d.revisions.length === 1 ? "" : "s"}
                    </span>
                    {latest && (
                      <Badge variant={drawingStatusVariant(latest.status)} dot>
                        {formatStatusLabel(latest.status)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((d) => (
            <Card key={d.id} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.discipline ?? "General"}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveDrawing(d)} className="gap-1.5">
                  <UploadCloud className="h-3.5 w-3.5" /> Manage
                </Button>
              </div>
              <ul className="divide-y divide-border">
                {d.revisions.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{r.versionLabel}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                      <Badge variant={drawingStatusVariant(r.status)} dot>
                        {formatStatusLabel(r.status)}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <NewDrawingDialog projectId={projectId} open={newOpen} onOpenChange={setNewOpen} onCreated={() => loadDrawings(projectId)} />

      <Dialog open={!!activeDrawing} onOpenChange={(open) => !open && setActiveDrawing(null)}>
        <DialogContent className="max-w-lg">
          {activeDrawing && (
            <DrawingManagePanel
              drawing={activeDrawing}
              onUploaded={() => {
                loadDrawings(projectId);
                setActiveDrawing(null);
              }}
              onReview={review}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DrawingManagePanel({
  drawing,
  onUploaded,
  onReview,
}: {
  drawing: Drawing;
  onUploaded: () => void;
  onReview: (revisionId: string, decision: "APPROVED" | "REJECTED") => void;
}) {
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const upload = async () => {
    if (!fileUrl) return;
    setSubmitting(true);
    try {
      await apiFetch(`/drawings/${drawing.id}/revisions`, {
        method: "POST",
        body: JSON.stringify({ versionLabel: `Rev-${new Date().toISOString().slice(0, 10)}`, fileUrl }),
      });
      toast.success("Revision uploaded");
      setFileUrl("");
      onUploaded();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload revision");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{drawing.title}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input placeholder="File URL for new revision" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
          <Button onClick={upload} loading={submitting} disabled={!fileUrl}>
            Upload
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {drawing.revisions.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">{r.versionLabel}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={drawingStatusVariant(r.status)} dot>
                  {formatStatusLabel(r.status)}
                </Badge>
                {r.status === "IN_REVIEW" && (
                  <div className="flex gap-1">
                    <Button size="icon" variant="success" className="h-7 w-7" onClick={() => onReview(r.id, "APPROVED")}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="danger" className="h-7 w-7" onClick={() => onReview(r.id, "REJECTED")}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
          {drawing.revisions.length === 0 && <p className="py-4 text-sm text-muted-foreground">No revisions yet.</p>}
        </ul>
      </div>
    </>
  );
}

function NewDrawingDialog({
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
  const [title, setTitle] = useState("");
  const [drawingDiscipline, setDrawingDiscipline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title || !projectId) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/drawings", {
        method: "POST",
        body: JSON.stringify({ projectId, title, discipline: drawingDiscipline || undefined }),
      });
      toast.success("Drawing created");
      setTitle("");
      setDrawingDiscipline("");
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create drawing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New drawing</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input placeholder="Drawing title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <NativeSelect value={drawingDiscipline} onChange={(e) => setDrawingDiscipline(e.target.value)}>
            <option value="">Select discipline…</option>
            {DISCIPLINES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </NativeSelect>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button onClick={submit} loading={submitting} disabled={!title}>
            Create drawing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
