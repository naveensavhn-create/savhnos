import { cn } from "@/lib/cn";

export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-soft",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
        {/* Drafting set-square */}
        <path d="M3 20L12 4L21 20H3Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
        {/* Blueprint grid line */}
        <path d="M7.5 14H16.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        {/* Warning-amber compass pivot */}
        <circle cx="12" cy="9" r="1.6" fill="#f59e0b" />
      </svg>
    </div>
  );
}
