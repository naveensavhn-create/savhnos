"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";

interface DashboardSummary {
  projects: { total: number; active: number; delayed: number; completed: number };
  workforce: { totalEmployees: number; clockedInNow: number; pendingLeaveRequests: number };
  approvals: { pendingDrawingReviews: number };
  finance: { revenue: number; expenses: number; profit: number };
}

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<DashboardSummary>("/dashboard/summary")
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-red-600">Failed to load dashboard: {error}</p>;
  }

  if (!summary) {
    return <p className="text-slate-500">Loading dashboard…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Projects</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total projects" value={summary.projects.total} />
          <StatCard label="Active" value={summary.projects.active} />
          <StatCard label="Delayed" value={summary.projects.delayed} />
          <StatCard label="Completed" value={summary.projects.completed} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Workforce</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Total employees" value={summary.workforce.totalEmployees} />
          <StatCard label="Clocked in now" value={summary.workforce.clockedInNow} />
          <StatCard label="Pending leave requests" value={summary.workforce.pendingLeaveRequests} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Approvals</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Drawings pending review" value={summary.approvals.pendingDrawingReviews} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Finance</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Revenue" value={currency.format(summary.finance.revenue)} />
          <StatCard label="Expenses" value={currency.format(summary.finance.expenses)} />
          <StatCard label="Profit" value={currency.format(summary.finance.profit)} />
        </div>
      </section>
    </div>
  );
}
