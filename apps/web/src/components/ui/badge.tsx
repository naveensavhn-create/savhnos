import type { StatusColor } from "@/lib/status";

const COLOR_CLASSES: Record<StatusColor, string> = {
  gray: "bg-steel-100 text-black border border-steel-300",
  blue: "bg-brand-100 text-black border border-brand-300",
  orange: "bg-safety-100 text-black border border-safety-300",
  red: "bg-alert-100 text-black border border-alert-300",
};

const DOT_CLASSES: Record<StatusColor, string> = {
  gray: "bg-steel-500",
  blue: "bg-brand-600",
  orange: "bg-safety-500",
  red: "bg-alert-600",
};

export function Badge({ color, children }: { color: StatusColor; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${COLOR_CLASSES[color]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[color]}`} />
      {children}
    </span>
  );
}
