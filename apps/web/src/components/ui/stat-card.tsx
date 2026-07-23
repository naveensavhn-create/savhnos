export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
