"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Accent = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const ACCENT_BAR: Record<Accent, string> = {
  neutral: "bg-muted-foreground/40",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

const ACCENT_ICON: Record<Accent, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300",
  success: "bg-success-50 text-success-700 dark:bg-success/10 dark:text-success",
  warning: "bg-warning-50 text-warning-700 dark:bg-warning/10 dark:text-warning",
  danger: "bg-danger-50 text-danger-700 dark:bg-danger/10 dark:text-danger",
  info: "bg-info-50 text-info-700 dark:bg-info/10 dark:text-info",
};

const ACCENT_STROKE: Record<Accent, string> = {
  neutral: "hsl(var(--muted-foreground))",
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--danger))",
  info: "hsl(var(--info))",
};

function useAnimatedNumber(value: number, durationMs = 600) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return display;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "neutral",
  hint,
  trend,
  sparkline,
  format,
  onClick,
}: {
  label: string;
  value: number;
  icon?: LucideIcon;
  accent?: Accent;
  hint?: string;
  trend?: number;
  sparkline?: number[];
  format?: (n: number) => string;
  onClick?: () => void;
}) {
  const animated = useAnimatedNumber(value);
  const formatted = format ? format(animated) : Math.round(animated).toLocaleString();
  const chartData = sparkline?.map((v, i) => ({ i, v }));

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-popover",
        onClick && "cursor-pointer"
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1", ACCENT_BAR[accent])} />
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", ACCENT_ICON[accent])}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">{formatted}</p>
          {(hint || trend !== undefined) && (
            <div className="mt-1 flex items-center gap-1.5">
              {trend !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-semibold",
                    trend >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(trend)}%
                </span>
              )}
              {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
            </div>
          )}
        </div>

        {chartData && chartData.length > 1 && (
          <div className="h-10 w-20 opacity-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT_STROKE[accent]} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ACCENT_STROKE[accent]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={ACCENT_STROKE[accent]}
                  strokeWidth={2}
                  fill={`url(#spark-${label})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
