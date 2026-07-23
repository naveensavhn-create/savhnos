type AccentColor = "gray" | "blue" | "orange" | "red";

const ACCENT_CLASSES: Record<AccentColor, string> = {
  gray: "border-t-steel-400",
  blue: "border-t-brand-600",
  orange: "border-t-safety-500",
  red: "border-t-alert-600",
};

export function StatCard({
  label,
  value,
  hint,
  accent = "gray",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: AccentColor;
}) {
  return (
    <div
      className={`rounded-xl border border-steel-200 border-t-4 bg-white p-5 shadow-sm ${ACCENT_CLASSES[accent]}`}
    >
      <div className="text-sm font-semibold text-black">{label}</div>
      <div className="mt-2 text-3xl font-bold text-black">{value}</div>
      {hint && <div className="mt-1 text-xs font-medium text-steel-600">{hint}</div>}
    </div>
  );
}
