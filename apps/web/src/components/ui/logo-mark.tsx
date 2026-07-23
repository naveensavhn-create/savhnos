export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg bg-brand-700"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        {/* Drafting set-square */}
        <path d="M3 20L12 4L21 20H3Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
        {/* Blueprint grid line */}
        <path d="M7.5 14H16.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        {/* Safety-orange compass pivot */}
        <circle cx="12" cy="9" r="1.6" fill="#f97316" />
      </svg>
    </div>
  );
}
