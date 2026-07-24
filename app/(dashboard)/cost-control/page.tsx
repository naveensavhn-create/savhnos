"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wallet, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, NativeSelect } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { formatStatusLabel, poStatusVariant } from "@/lib/status";
import { ExpenseCategory } from "@/lib/enums";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

interface Project {
  id: string;
  name: string;
  code: string;
}
interface CostLine {
  category: string;
  description: string | null;
  budget: number;
  committed: number;
  actual: number;
  forecast: number;
  variance: number;
}
interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  category: string;
  amount: string | number;
  status: string;
  issuedAt: string;
}
interface CostReport {
  lines: CostLine[];
  totals: { budget: number; committed: number; actual: number; forecast: number; variance: number };
  purchaseOrders: PurchaseOrder[];
}

export default function CostControlPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [report, setReport] = useState<CostReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [poOpen, setPoOpen] = useState(false);

  useEffect(() => {
    apiFetch<Project[]>("/projects").then((ps) => {
      setProjects(ps);
      if (ps.length > 0) setProjectId(ps[0].id);
    });
  }, []);

  const load = (pid: string) => {
    setLoading(true);
    apiFetch<CostReport>(`/projects/${pid}/cost-control`)
      .then(setReport)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (projectId) load(projectId);
  }, [projectId]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cost Control</h1>
          <p className="text-sm text-muted-foreground">Budget → committed → actual → forecast, by category.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NativeSelect value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-56">
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </NativeSelect>
          <Button variant="outline" onClick={() => setBudgetOpen(true)} disabled={!projectId} className="gap-1.5">
            <Plus className="h-4 w-4" /> Set budget
          </Button>
          <Button onClick={() => setPoOpen(true)} disabled={!projectId} className="gap-1.5">
            <Plus className="h-4 w-4" /> New PO
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !report || report.lines.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No cost lines yet"
          description="Set a budget for a category or raise a purchase order to start tracking cost."
          action={
            <Button onClick={() => setBudgetOpen(true)} disabled={!projectId}>
              Set budget
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <SummaryStat label="Budget" value={report.totals.budget} />
            <SummaryStat label="Committed" value={report.totals.committed} />
            <SummaryStat label="Actual" value={report.totals.actual} />
            <SummaryStat label="Forecast" value={report.totals.forecast} />
            <SummaryStat label="Variance" value={report.totals.variance} signed />
          </div>

          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Budget</th>
                    <th className="px-4 py-3 text-right">Committed</th>
                    <th className="px-4 py-3 text-right">Actual</th>
                    <th className="px-4 py-3 text-right">Forecast</th>
                    <th className="px-4 py-3 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {report.lines.map((l) => (
                    <tr key={l.category} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{formatStatusLabel(l.category)}</td>
                      <td className="px-4 py-3 text-right">{currency.format(l.budget)}</td>
                      <td className="px-4 py-3 text-right">{currency.format(l.committed)}</td>
                      <td className="px-4 py-3 text-right">{currency.format(l.actual)}</td>
                      <td className="px-4 py-3 text-right">{currency.format(l.forecast)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${l.variance < 0 ? "text-danger" : "text-success"}`}>
                        {currency.format(l.variance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase orders</CardTitle>
            </CardHeader>
            <CardContent>
              {report.purchaseOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No purchase orders yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {report.purchaseOrders.map((po) => (
                    <li key={po.id} className="flex items-center justify-between py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {po.poNumber} · {po.vendorName}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatStatusLabel(po.category)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{currency.format(Number(po.amount))}</span>
                        <Badge variant={poStatusVariant(po.status)}>{formatStatusLabel(po.status)}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <SetBudgetDialog projectId={projectId} open={budgetOpen} onOpenChange={setBudgetOpen} onSaved={() => load(projectId)} />
      <NewPurchaseOrderDialog projectId={projectId} open={poOpen} onOpenChange={setPoOpen} onCreated={() => load(projectId)} />
    </div>
  );
}

function SummaryStat({ label, value, signed = false }: { label: string; value: number; signed?: boolean }) {
  const negative = signed && value < 0;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {signed && (negative ? <TrendingDown className="h-3.5 w-3.5 text-danger" /> : <TrendingUp className="h-3.5 w-3.5 text-success" />)}
        </div>
        <p className={`mt-1 text-lg font-bold ${negative ? "text-danger" : ""}`}>{currency.format(value)}</p>
      </CardContent>
    </Card>
  );
}

function SetBudgetDialog({
  projectId,
  open,
  onOpenChange,
  onSaved,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.MATERIAL);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!budgetAmount) return;
    setSubmitting(true);
    try {
      await apiFetch(`/projects/${projectId}/cost-control/budget-lines`, {
        method: "POST",
        body: JSON.stringify({ category, budgetAmount: Number(budgetAmount), description: description || undefined }),
      });
      toast.success("Budget saved");
      setBudgetAmount("");
      setDescription("");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save budget");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set category budget</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {Object.values(ExpenseCategory).map((c) => (
              <option key={c} value={c}>
                {formatStatusLabel(c)}
              </option>
            ))}
          </NativeSelect>
          <Input type="number" placeholder="Budget amount (INR)" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} />
          <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={submit} loading={submitting} disabled={!budgetAmount}>
            Save budget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NewPurchaseOrderDialog({
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
  const [form, setForm] = useState<{ poNumber: string; vendorName: string; category: ExpenseCategory; amount: string }>({
    poNumber: "",
    vendorName: "",
    category: ExpenseCategory.MATERIAL,
    amount: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!form.poNumber || !form.vendorName || !form.amount) return;
    setSubmitting(true);
    try {
      await apiFetch(`/projects/${projectId}/cost-control/purchase-orders`, {
        method: "POST",
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      toast.success("Purchase order created");
      setForm({ poNumber: "", vendorName: "", category: ExpenseCategory.MATERIAL, amount: "" });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create purchase order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New purchase order</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input placeholder="PO number" value={form.poNumber} onChange={(e) => setForm({ ...form, poNumber: e.target.value })} />
          <Input placeholder="Vendor name" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} />
          <NativeSelect value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
            {Object.values(ExpenseCategory).map((c) => (
              <option key={c} value={c}>
                {formatStatusLabel(c)}
              </option>
            ))}
          </NativeSelect>
          <Input type="number" placeholder="Amount (INR)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Button onClick={submit} loading={submitting} disabled={!form.poNumber || !form.vendorName || !form.amount}>
            Create PO
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
