"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Clock,
  Users,
  TrendingUp,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  MapPin,
  LogIn,
  LogOut as LogOutIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { usePendingApprovals } from "@/hooks/use-pending-approvals";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { formatStatusLabel, projectStatusVariant } from "@/lib/status";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--danger))", "hsl(var(--info))", "hsl(var(--muted-foreground))"];

interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
}
interface Employee {
  id: string;
  user: { name: string; role: string };
}
interface AttendanceToday {
  id: string;
  clockInAt: string;
  clockOutAt: string | null;
  employee: { user: { name: string } };
  project: { name: string; code: string } | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { summary, error } = useDashboardSummary();
  const { revisions } = usePendingApprovals();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [today, setToday] = useState<AttendanceToday[] | null>(null);
  const [canSeeTeam, setCanSeeTeam] = useState(true);

  useEffect(() => {
    apiFetch<Project[]>("/projects").then(setProjects).catch(() => setProjects([]));
    apiFetch<Employee[]>("/employees").then(setEmployees).catch(() => setEmployees([]));
    apiFetch<AttendanceToday[]>("/attendance/today")
      .then(setToday)
      .catch(() => setCanSeeTeam(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? user?.email.split("@")[0] ?? "there";

  const statusCounts = projects
    ? Object.entries(
        projects.reduce<Record<string, number>>((acc, p) => {
          acc[p.status] = (acc[p.status] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([status, count]) => ({ name: formatStatusLabel(status), value: count }))
    : [];

  const roleCounts = employees
    ? Object.entries(
        employees.reduce<Record<string, number>>((acc, e) => {
          const role = formatStatusLabel(e.user.role);
          acc[role] = (acc[role] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([role, count]) => ({ role, count }))
    : [];

  if (error) {
    return (
      <div className="rounded-2xl border border-danger-100 bg-danger-50 px-5 py-4 text-sm font-medium text-danger-700 dark:border-danger/20 dark:bg-danger/10 dark:text-danger">
        Failed to load dashboard: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, <span className="capitalize">{firstName}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your workspace today ·{" "}
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {!summary ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total projects" value={summary.projects.total} icon={FolderKanban} accent="neutral" />
          <StatCard label="Active projects" value={summary.projects.active} icon={TrendingUp} accent="primary" />
          <StatCard label="Delayed" value={summary.projects.delayed} icon={AlertTriangle} accent="danger" />
          <StatCard label="Completed" value={summary.projects.completed} icon={CheckCircle2} accent="success" />
          <StatCard label="Team members" value={summary.workforce.totalEmployees} icon={Users} accent="neutral" />
          <StatCard label="Clocked in now" value={summary.workforce.clockedInNow} icon={Clock} accent="primary" />
          <StatCard
            label="Revenue"
            value={summary.finance.revenue}
            icon={Wallet}
            accent="info"
            format={(n) => currency.format(n)}
          />
          <StatCard
            label="Profit"
            value={summary.finance.profit}
            icon={TrendingUp}
            accent={summary.finance.profit < 0 ? "danger" : "success"}
            format={(n) => currency.format(n)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Project status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusCounts.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No projects yet.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusCounts} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                      {statusCounts.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--popover))",
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {statusCounts.map((s, i) => (
                <span key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Headcount by role</CardTitle>
          </CardHeader>
          <CardContent>
            {roleCounts.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No employees yet.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleCounts} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="role" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <ChartTooltip
                      cursor={{ fill: "hsl(var(--accent))" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--popover))",
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{canSeeTeam ? "Who's working today" : "My attendance"}</CardTitle>
            <Link href="/attendance">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {canSeeTeam ? (
              !today ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
              ) : today.length === 0 ? (
                <EmptyState icon={Clock} title="No clock-ins yet today" description="Attendance will appear here as your team clocks in." />
              ) : (
                <ul className="divide-y divide-border">
                  {today.slice(0, 6).map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-2.5">
                      <Avatar name={a.employee.user.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.employee.user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.project ? `${a.project.code} · ${a.project.name}` : "Office"}
                        </p>
                      </div>
                      <Badge variant={a.clockOutAt ? "neutral" : "success"} dot>
                        {a.clockOutAt ? "Clocked out" : "On site"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <PersonalAttendance />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Approvals waiting</CardTitle>
            <Link href="/approvals">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!revisions ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
            ) : revisions.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="All caught up" description="No drawing revisions are waiting for review." />
            ) : (
              <ul className="divide-y divide-border">
                {revisions.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-50 text-warning-700 dark:bg-warning/10 dark:text-warning">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.drawingTitle}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.projectCode} · {r.versionLabel}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PersonalAttendance() {
  const [history, setHistory] = useState<AttendanceToday[] | null>(null);

  useEffect(() => {
    apiFetch<AttendanceToday[]>("/attendance/me").then(setHistory).catch(() => setHistory([]));
  }, []);

  if (!history) return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
  if (history.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No attendance recorded yet"
        description="Head to Attendance to clock in for the day."
        action={
          <Link href="/attendance">
            <Button size="sm" className="gap-1.5">
              <LogIn className="h-3.5 w-3.5" /> Clock in
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {history.slice(0, 6).map((a) => (
        <li key={a.id} className="flex items-center gap-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            {a.clockOutAt ? <LogOutIcon className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{new Date(a.clockInAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
            <p className="truncate text-xs text-muted-foreground">{a.project ? `${a.project.code} · ${a.project.name}` : "Office"}</p>
          </div>
          <Badge variant={a.clockOutAt ? "neutral" : "success"} dot>
            {a.clockOutAt ? "Complete" : "In progress"}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
