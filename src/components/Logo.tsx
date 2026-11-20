export function PineappleMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <path d="M20 14C16 8 12 7 9 8c3 1 5 3 6 6zM20 14c0-6 1-10 3-12 1 4 0 8-3 12zM20 14c4-6 8-7 11-6-3 1-5 3-6 6z" fill="#2f8f55" />
      <ellipse cx="20" cy="26" rx="12" ry="13" fill="#ffc21a" stroke="#231f16" strokeWidth="2.2" />
      <path d="M12 18l16 16M20 14l10 10M10 26l12 12M28 18 12 34M20 14 10 24M30 26 18 38" stroke="#231f16" strokeWidth="1.6" strokeLinecap="round" opacity=".55" clipPath="url(#b)" />
      <clipPath id="b"><ellipse cx="20" cy="26" rx="12" ry="13" /></clipPath>
    </svg>
  );
}
export default function Logo() {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <PineappleMark />
      <span className="display text-[1.45rem] leading-none tracking-wide">pineapple<span className="text-link hidden sm:inline"> games</span></span>
    </span>
  );
}
