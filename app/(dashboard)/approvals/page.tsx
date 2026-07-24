"use client";

import Link from "next/link";
import { toast } from "sonner";
import { CircleCheckBig, Check, X, Ruler, Users } from "lucide-react";
import { usePendingApprovals } from "@/hooks/use-pending-approvals";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { apiFetch, ApiError } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";

export default function ApprovalsPage() {
  const { revisions, loading, reload } = usePendingApprovals();
  const { summary } = useDashboardSummary();

  const review = async (revisionId: string, decision: "APPROVED" | "REJECTED") => {
    try {
      await apiFetch(`/drawings/revisions/${revisionId}/review`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      toast.success(decision === "APPROVED" ? "Revision approved" : "Revision rejected");
      reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "You may not have permission to review drawings");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
        <p className="text-sm text-muted-foreground">Everything waiting on a decision, in one inbox.</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-700 dark:bg-warning/10 dark:text-warning">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {summary?.workforce.pendingLeaveRequests ?? 0} leave request
              {summary?.workforce.pendingLeaveRequests === 1 ? "" : "s"} pending
            </p>
            <p className="text-sm text-muted-foreground">
              Leave approval actions aren&apos;t wired to the API yet — this count is real, the action isn&apos;t.
            </p>
          </div>
          <Badge variant="warning">Read-only</Badge>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Ruler className="h-4 w-4" /> Drawing revisions
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : !revisions || revisions.length === 0 ? (
          <EmptyState icon={CircleCheckBig} title="All caught up" description="No drawing revisions are waiting for review across any project." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {revisions.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{r.drawingTitle}</p>
                    <Link href={`/projects/${r.projectId}`} className="text-xs text-muted-foreground hover:text-primary">
                      {r.projectCode} · {r.projectName}
                    </Link>
                  </div>
                  <Badge variant="warning">{r.versionLabel}</Badge>
                </div>
                {r.discipline && <p className="mt-2 text-xs text-muted-foreground">{r.discipline}</p>}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="success" className="flex-1 gap-1.5" onClick={() => review(r.id, "APPROVED")}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="danger" className="flex-1 gap-1.5" onClick={() => review(r.id, "REJECTED")}>
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
