"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export interface DashboardSummary {
  projects: { total: number; active: number; delayed: number; completed: number };
  workforce: { totalEmployees: number; clockedInNow: number; pendingLeaveRequests: number };
  approvals: { pendingDrawingReviews: number };
  finance: { revenue: number; expenses: number; profit: number };
  riskAndQuality: { openSafetyIncidents: number; openNonConformances: number; pendingVariations: number };
}

let cached: DashboardSummary | null = null;
const listeners = new Set<(s: DashboardSummary) => void>();

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const listener = (s: DashboardSummary) => setSummary(s);
    listeners.add(listener);

    apiFetch<DashboardSummary>("/dashboard/summary")
      .then((s) => {
        cached = s;
        listeners.forEach((l) => l(s));
      })
      .catch((err) => setError(err.message));

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { summary, error };
}
