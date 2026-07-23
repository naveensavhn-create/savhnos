import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted text-muted-foreground",
        primary: "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-900 dark:bg-primary-900/30 dark:text-primary-300",
        success: "border-success-100 bg-success-50 text-success-700 dark:border-success/20 dark:bg-success/10 dark:text-success",
        warning: "border-warning-100 bg-warning-50 text-warning-700 dark:border-warning/20 dark:bg-warning/10 dark:text-warning",
        danger: "border-danger-100 bg-danger-50 text-danger-700 dark:border-danger/20 dark:bg-danger/10 dark:text-danger",
        info: "border-info-100 bg-info-50 text-info-700 dark:border-info/20 dark:bg-info/10 dark:text-info",
        outline: "border-border text-foreground",
        solid: "border-transparent bg-primary text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const DOT_CLASS: Record<string, string> = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  outline: "bg-foreground",
  solid: "bg-primary-foreground",
};

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASS[variant ?? "neutral"])} />}
      {children}
    </span>
  );
}
