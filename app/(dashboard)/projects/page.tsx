"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, MapPin, FolderKanban, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { pluralize } from "@/lib/cn";
import { useNewFlag } from "@/hooks/use-new-flag";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatStatusLabel, projectStatusVariant } from "@/lib/status";
import { NewProjectDialog } from "@/modules/projects/components/new-project-dialog";

interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
  budget: string | null;
  address: string | null;
  client: { name: string } | null;
  geofence: { latitude: number; longitude: number; radiusMeters: number } | null;
  _count: { assignments: number; tasks: number };
}

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "code",
    header: "Project",
    cell: ({ row }) => (
      <Link href={`/projects/${row.original.id}`} className="group flex flex-col">
        <span className="font-semibold text-foreground group-hover:text-primary">{row.original.name}</span>
        <span className="font-mono text-xs text-muted-foreground">{row.original.code}</span>
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={projectStatusVariant(row.original.status)} dot>
        {formatStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    id: "client",
    header: "Client",
    accessorFn: (row) => row.client?.name ?? "—",
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => (row.original.budget ? currency.format(Number(row.original.budget)) : "—"),
  },
  {
    id: "team",
    header: "Team",
    accessorFn: (row) => row._count.assignments,
  },
  {
    id: "geofence",
    header: "Geofence",
    cell: ({ row }) =>
      row.original.geofence ? (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {row.original.geofence.radiusMeters}m
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Not set</span>
      ),
  },
  {
    id: "action",
    header: "",
    cell: ({ row }) => (
      <Link href={`/projects/${row.original.id}`}>
        <Button variant="ghost" size="icon">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const openViaQuery = useNewFlag();

  const load = () => {
    setLoading(true);
    apiFetch<Project[]>("/projects")
      .then(setProjects)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    if (openViaQuery) setDialogOpen(true);
  }, [openViaQuery]);

  const activeCount = useMemo(() => projects.filter((p) => p.status === "ACTIVE").length, [projects]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${projects.length} ${pluralize(projects.length, "project")} · ${activeCount} active`}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        searchPlaceholder="Search projects…"
        emptyState={
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project and set its geofence so field attendance works immediately."
            action={
              <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> New project
              </Button>
            }
          />
        }
      />

      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={load} />
    </div>
  );
}
