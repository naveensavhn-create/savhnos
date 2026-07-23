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
    return (
      <p className="rounded-md border border-alert-300 bg-alert-50 px-4 py-3 font-medium text-black">
        Failed to load dashboard: {error}
      </p>
    );
  }

  if (!summary) {
    return <p className="text-black">Loading dashboard…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-black">Projects</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total projects" value={summary.projects.total} accent="gray" />
          <StatCard label="Active" value={summary.projects.active} accent="blue" />
          <StatCard label="Delayed" value={summary.projects.delayed} accent="red" />
          <StatCard label="Completed" value={summary.projects.completed} accent="gray" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-black">Workforce</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Total employees" value={summary.workforce.totalEmployees} accent="gray" />
          <StatCard label="Clocked in now" value={summary.workforce.clockedInNow} accent="blue" />
          <StatCard
            label="Pending leave requests"
            value={summary.workforce.pendingLeaveRequests}
            accent="orange"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-black">Approvals</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard
            label="Drawings pending review"
            value={summary.approvals.pendingDrawingReviews}
            accent="orange"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-black">Finance</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Revenue" value={currency.format(summary.finance.revenue)} accent="blue" />
          <StatCard label="Expenses" value={currency.format(summary.finance.expenses)} accent="orange" />
          <StatCard
            label="Profit"
            value={currency.format(summary.finance.profit)}
            accent={summary.finance.profit < 0 ? "red" : "gray"}
          />
        </div>
      </section>
    </div>
  );
}
