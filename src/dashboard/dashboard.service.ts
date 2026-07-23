import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(companyId: string) {
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
    ] = await Promise.all([
      this.prisma.project.count({ where: { companyId } }),
      this.prisma.project.count({ where: { companyId, status: "ACTIVE" } }),
      this.prisma.project.count({ where: { companyId, status: "DELAYED" } }),
      this.prisma.project.count({ where: { companyId, status: "COMPLETED" } }),
      this.prisma.employee.count({ where: { companyId } }),
      this.prisma.attendance.count({
        where: { employee: { companyId }, clockInAt: { gte: startOfDay }, clockOutAt: null },
      }),
      this.prisma.leaveRequest.count({ where: { employee: { companyId }, status: "PENDING" } }),
      this.prisma.drawingRevision.count({
        where: { drawing: { project: { companyId } }, status: "IN_REVIEW" },
      }),
      this.prisma.invoice.aggregate({
        where: { companyId },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { companyId },
        _sum: { amount: true },
      }),
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
    };
  }
}
