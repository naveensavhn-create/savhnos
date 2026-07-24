import { z } from "zod";
import { ExpenseCategory } from "@/lib/enums";

export const upsertBudgetLineSchema = z.object({
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().optional(),
  budgetAmount: z.number().nonnegative(),
  forecastAmount: z.number().nonnegative().optional(),
});

export const createPurchaseOrderSchema = z.object({
  poNumber: z.string().min(1),
  vendorName: z.string().min(1),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().optional(),
  amount: z.number().positive(),
});

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(["DRAFT", "ISSUED", "PARTIALLY_INVOICED", "CLOSED", "CANCELLED"]),
});
