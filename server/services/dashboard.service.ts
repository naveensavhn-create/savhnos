import { prisma } from "@/lib/prisma";

export async function getDashboardSummary(companyId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    totalProjects,
    activeProjects,
    delayedProjects,
    completedProjects,
    totalEmployees,
    clockedInToday,
    pendingLeave,
    pendingDrawingReviews,
    invoices,
    expenses,
    openSafetyIncidents,
    openNonConformances,
    pendingVariations,
  ] = await Promise.all([
    prisma.project.count({ where: { companyId } }),
    prisma.project.count({ where: { companyId, status: "ACTIVE" } }),
    prisma.project.count({ where: { companyId, status: "DELAYED" } }),
    prisma.project.count({ where: { companyId, status: "COMPLETED" } }),
    prisma.employee.count({ where: { companyId } }),
    prisma.attendance.count({
      where: { employee: { companyId }, clockInAt: { gte: startOfDay }, clockOutAt: null },
    }),
    prisma.leaveRequest.count({ where: { employee: { companyId }, status: "PENDING" } }),
    prisma.drawingRevision.count({
      where: { drawing: { project: { companyId } }, status: "IN_REVIEW" },
    }),
    prisma.invoice.aggregate({
      where: { companyId },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { companyId },
      _sum: { amount: true },
    }),
    prisma.safetyIncident.count({ where: { project: { companyId }, status: { not: "CLOSED" } } }),
    prisma.nonConformance.count({ where: { project: { companyId }, status: { not: "CLOSED" } } }),
    prisma.variation.count({ where: { project: { companyId }, status: "SUBMITTED" } }),
  ]);

  const revenue = Number(invoices._sum.amount ?? 0);
  const totalExpenses = Number(expenses._sum.amount ?? 0);

  return {
    projects: {
      total: totalProjects,
      active: activeProjects,
      delayed: delayedProjects,
      completed: completedProjects,
    },
    workforce: {
      totalEmployees,
      clockedInNow: clockedInToday,
      pendingLeaveRequests: pendingLeave,
    },
    approvals: {
      pendingDrawingReviews,
    },
    finance: {
      revenue,
      expenses: totalExpenses,
      profit: revenue - totalExpenses,
    },
    riskAndQuality: {
      openSafetyIncidents,
      openNonConformances,
      pendingVariations,
    },
  };
}
