"use client";

import { useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { LayoutGrid, List, Plus, Users, MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useNewFlag } from "@/lib/use-new-flag";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { employmentStatusVariant, formatStatusLabel } from "@/lib/status";
import { cn } from "@/lib/cn";
import { NewEmployeeDialog } from "./new-employee-dialog";
import { EmployeeDetailDialog } from "./employee-detail-dialog";

interface Employee {
  id: string;
  employeeCode: string;
  designation: string | null;
  department: string | null;
  status: string;
  user: { name: string; email: string; role: string; isActive: boolean };
  branch: { name: string } | null;
}

interface AttendanceToday {
  employeeId: string;
  clockOutAt: string | null;
  project: { name: string; code: string } | null;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [todayMap, setTodayMap] = useState<Map<string, AttendanceToday>>(new Map());
  const [search, setSearch] = useState("");
  const openViaQuery = useNewFlag();

  const load = () => {
    setLoading(true);
    apiFetch<Employee[]>("/employees")
      .then(setEmployees)
      .finally(() => setLoading(false));
    apiFetch<AttendanceToday[]>("/attendance/today")
      .then((records) => setTodayMap(new Map(records.map((r) => [r.employeeId, r]))))
      .catch(() => {});
  };

  useEffect(load, []);
  useEffect(() => {
    if (openViaQuery) setDialogOpen(true);
  }, [openViaQuery]);

  const filtered = useMemo(
    () =>
      employees.filter((e) =>
        `${e.user.name} ${e.employeeCode} ${e.designation ?? ""} ${e.department ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [employees, search]
  );

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "user.name",
      header: "Name",
      cell: ({ row }) => (
        <button onClick={() => setSelectedId(row.original.id)} className="flex items-center gap-2.5 text-left hover:text-primary">
          <Avatar name={row.original.user.name} size="sm" />
          <div>
            <p className="font-medium">{row.original.user.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{row.original.employeeCode}</p>
          </div>
        </button>
      ),
    },
    { id: "role", header: "Role", accessorFn: (r) => formatStatusLabel(r.user.role) },
    { id: "designation", header: "Designation", accessorFn: (r) => r.designation ?? "—" },
    { id: "department", header: "Department", accessorFn: (r) => r.department ?? "—" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={employmentStatusVariant(row.original.status)} dot>
          {formatStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      id: "today",
      header: "Today",
      cell: ({ row }) => {
        const rec = todayMap.get(row.original.id);
        if (!rec) return <span className="text-xs text-muted-foreground">Not clocked in</span>;
        return (
          <Badge variant={rec.clockOutAt ? "neutral" : "success"} dot>
            {rec.clockOutAt ? "Clocked out" : "On site"}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${employees.length} people`}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border bg-muted/60 p-1">
            <button
              onClick={() => setView("grid")}
              className={cn("rounded-lg p-1.5", view === "grid" ? "bg-card shadow-soft" : "text-muted-foreground")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={cn("rounded-lg p-1.5", view === "table" ? "bg-card shadow-soft" : "text-muted-foreground")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add employee
          </Button>
        </div>
      </div>

      {view === "table" ? (
        <DataTable
          columns={columns}
          data={employees}
          loading={loading}
          searchPlaceholder="Search employees…"
          emptyState={<EmptyState icon={Users} title="No employees yet" action={<Button onClick={() => setDialogOpen(true)}>Add employee</Button>} />}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="max-w-xs">
            <Input placeholder="Search employees…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title="No employees found" action={<Button onClick={() => setDialogOpen(true)}>Add employee</Button>} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((e) => {
                const rec = todayMap.get(e.id);
                return (
                  <Card
                    key={e.id}
                    className="cursor-pointer p-5 transition-shadow hover:shadow-popover"
                    onClick={() => setSelectedId(e.id)}
                  >
                    <div className="flex items-start justify-between">
                      <Avatar name={e.user.name} size="lg" />
                      <Badge variant={employmentStatusVariant(e.status)} dot>
                        {formatStatusLabel(e.status)}
                      </Badge>
                    </div>
                    <p className="mt-3 truncate font-semibold">{e.user.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {e.designation ?? formatStatusLabel(e.user.role)}
                      {e.department ? ` · ${e.department}` : ""}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="font-mono text-xs text-muted-foreground">{e.employeeCode}</span>
                      {rec ? (
                        <Badge variant={rec.clockOutAt ? "neutral" : "success"} dot className="text-[10px]">
                          {rec.clockOutAt ? "Clocked out" : "On site"}
                        </Badge>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3" /> Not clocked in
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <NewEmployeeDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={load} />
      <EmployeeDetailDialog employeeId={selectedId} onOpenChange={setSelectedId} />
    </div>
  );
}
