import { prisma } from "@/lib/prisma";
import type { ExpenseCategory, POStatus } from "@/lib/enums";
import { NotFoundError } from "@/server/errors";

export interface CostControlLine {
  category: ExpenseCategory;
  description: string | null;
  budget: number;
  committed: number;
  actual: number;
  forecast: number;
  variance: number;
}

/**
 * Four-column cost control report (Budget → Committed → Actual → Forecast)
 * per project, grouped by expense category. "Actual" is derived from the
 * existing Expense model; BudgetLine and PurchaseOrder supply Budget and
 * Committed. Forecast defaults to max(actual, committed) unless a manual
 * override is set on the BudgetLine.
 */
export async function getCostControlReport(companyId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, companyId } });
  if (!project) throw new NotFoundError("Project not found");

  const [budgetLines, purchaseOrders, expenses] = await Promise.all([
    prisma.budgetLine.findMany({ where: { projectId } }),
    prisma.purchaseOrder.findMany({ where: { projectId, status: { not: "CANCELLED" } }, orderBy: { issuedAt: "desc" } }),
    prisma.expense.findMany({ where: { projectId } }),
  ]);

  const categories = new Set<string>([
    ...budgetLines.map((b) => b.category),
    ...purchaseOrders.map((p) => p.category),
    ...expenses.map((e) => e.category),
  ]);

  const lines: CostControlLine[] = Array.from(categories).map((category) => {
    const budgetLine = budgetLines.find((b) => b.category === category);
    const committed = purchaseOrders
      .filter((p) => p.category === category)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const actual = expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const budget = budgetLine ? Number(budgetLine.budgetAmount) : 0;
    const forecast =
      budgetLine?.forecastAmount != null ? Number(budgetLine.forecastAmount) : Math.max(actual, committed);
    return {
      category: category as ExpenseCategory,
      description: budgetLine?.description ?? null,
      budget,
      committed,
      actual,
      forecast,
      variance: budget - forecast,
    };
  });

  const totals = lines.reduce(
    (acc, l) => ({
      budget: acc.budget + l.budget,
      committed: acc.committed + l.committed,
      actual: acc.actual + l.actual,
      forecast: acc.forecast + l.forecast,
      variance: acc.variance + l.variance,
    }),
    { budget: 0, committed: 0, actual: 0, forecast: 0, variance: 0 }
  );

  return { lines, totals, purchaseOrders };
}

export interface UpsertBudgetLineInput {
  category: ExpenseCategory;
  description?: string;
  budgetAmount: number;
  forecastAmount?: number;
}

export async function upsertBudgetLine(companyId: string, projectId: string, input: UpsertBudgetLineInput) {
  const project = await prisma.project.findFirst({ where: { id: projectId, companyId } });
  if (!project) throw new NotFoundError("Project not found");
  return prisma.budgetLine.upsert({
    where: { projectId_category: { projectId, category: input.category } },
    create: { projectId, ...input },
    update: {
      description: input.description,
      budgetAmount: input.budgetAmount,
      forecastAmount: input.forecastAmount,
    },
  });
}

export interface CreatePurchaseOrderInput {
  poNumber: string;
  vendorName: string;
  category: ExpenseCategory;
  description?: string;
  amount: number;
}

export async function createPurchaseOrder(companyId: string, projectId: string, input: CreatePurchaseOrderInput) {
  const project = await prisma.project.findFirst({ where: { id: projectId, companyId } });
  if (!project) throw new NotFoundError("Project not found");
  return prisma.purchaseOrder.create({ data: { projectId, ...input, status: "ISSUED" } });
}

export async function updatePurchaseOrderStatus(companyId: string, poId: string, status: POStatus) {
  const po = await prisma.purchaseOrder.findFirst({ where: { id: poId, project: { companyId } } });
  if (!po) throw new NotFoundError("Purchase order not found");
  return prisma.purchaseOrder.update({ where: { id: poId }, data: { status } });
}
