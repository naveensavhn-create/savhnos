"use client";

import { useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { KanbanSquare, List, Plus, Handshake, Mail, Phone } from "lucide-react";
import { PipelineStage } from "@savhnos/shared";
import { apiFetch, ApiError } from "@/lib/api";
import { useNewFlag } from "@/lib/use-new-flag";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatStatusLabel, pipelineStageVariant } from "@/lib/status";
import { cn } from "@/lib/cn";
import { NewClientDialog } from "./new-client-dialog";

interface Client {
  id: string;
  name: string;
  organization: string | null;
  email: string | null;
  phone: string | null;
  pipelineStage: string;
  estimatedValue: string | null;
}

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0, notation: "compact" });

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const openViaQuery = useNewFlag();

  const load = () => {
    setLoading(true);
    apiFetch<Client[]>("/clients")
      .then(setClients)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => {
    if (openViaQuery) setDialogOpen(true);
  }, [openViaQuery]);

  const updateStage = async (id: string, pipelineStage: string) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, pipelineStage } : c)));
    try {
      await apiFetch(`/clients/${id}`, { method: "PATCH", body: JSON.stringify({ pipelineStage }) });
      toast.success("Pipeline stage updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update stage");
      load();
    }
  };

  const totalPipelineValue = useMemo(
    () => clients.reduce((sum, c) => sum + (c.estimatedValue ? Number(c.estimatedValue) : 0), 0),
    [clients]
  );

  const columns: ColumnDef<Client>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { id: "organization", header: "Organization", accessorFn: (r) => r.organization ?? "—" },
    { id: "contact", header: "Contact", accessorFn: (r) => r.email ?? r.phone ?? "—" },
    {
      accessorKey: "pipelineStage",
      header: "Stage",
      cell: ({ row }) => (
        <Badge variant={pipelineStageVariant(row.original.pipelineStage)} dot>
          {formatStatusLabel(row.original.pipelineStage)}
        </Badge>
      ),
    },
    {
      id: "value",
      header: "Est. value",
      accessorFn: (r) => (r.estimatedValue ? Number(r.estimatedValue) : 0),
      cell: ({ row }) => (row.original.estimatedValue ? currency.format(Number(row.original.estimatedValue)) : "—"),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients &amp; CRM</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${clients.length} clients · ${currency.format(totalPipelineValue)} in pipeline`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border bg-muted/60 p-1">
            <button onClick={() => setView("kanban")} className={cn("rounded-lg p-1.5", view === "kanban" ? "bg-card shadow-soft" : "text-muted-foreground")}>
              <KanbanSquare className="h-4 w-4" />
            </button>
            <button onClick={() => setView("table")} className={cn("rounded-lg p-1.5", view === "table" ? "bg-card shadow-soft" : "text-muted-foreground")}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> New client
          </Button>
        </div>
      </div>

      {clients.length === 0 && !loading ? (
        <EmptyState icon={Handshake} title="No clients yet" description="Add your first lead to start tracking the pipeline." action={<Button onClick={() => setDialogOpen(true)}>New client</Button>} />
      ) : view === "table" ? (
        <DataTable columns={columns} data={clients} loading={loading} searchPlaceholder="Search clients…" />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.values(PipelineStage).map((stage) => {
            const items = clients.filter((c) => c.pipelineStage === stage);
            return (
              <div
                key={stage}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dragId && updateStage(dragId, stage)}
                className="flex w-72 shrink-0 flex-col gap-2 rounded-2xl bg-muted/50 p-2.5"
              >
                <div className="flex items-center justify-between px-1.5 py-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {formatStatusLabel(stage)}
                  </span>
                  <Badge variant="neutral" className="text-[10px]">
                    {items.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((c) => (
                    <Card
                      key={c.id}
                      draggable
                      onDragStart={() => setDragId(c.id)}
                      onDragEnd={() => setDragId(null)}
                      className="cursor-grab p-3.5 active:cursor-grabbing"
                    >
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      {c.organization && <p className="truncate text-xs text-muted-foreground">{c.organization}</p>}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          {c.email ? <Mail className="h-3 w-3" /> : c.phone ? <Phone className="h-3 w-3" /> : null}
                          <span className="truncate">{c.email ?? c.phone ?? ""}</span>
                        </div>
                        {c.estimatedValue && (
                          <span className="shrink-0 text-xs font-semibold">{currency.format(Number(c.estimatedValue))}</span>
                        )}
                      </div>
                    </Card>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewClientDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={load} />
    </div>
  );
}
