import type { Game } from "@/lib/types";
import { hashStr } from "@/lib/util";

const SCHEMES = [
  { bg: "#ffc21a", fg: "#231f16", a: "#f0532f", b: "#fff8e7" },
  { bg: "#2f9e5b", fg: "#fff8e7", a: "#ffc21a", b: "#1d6b3c" },
  { bg: "#f0532f", fg: "#fff8e7", a: "#ffc21a", b: "#b73414" },
  { bg: "#2d9cdb", fg: "#0d2a3a", a: "#fff8e7", b: "#1d6f9f" },
  { bg: "#231f16", fg: "#ffc21a", a: "#2f9e5b", b: "#f0532f" },
  { bg: "#f7a8c4", fg: "#3a1226", a: "#fff8e7", b: "#e0709a" },
  { bg: "#ff8a3d", fg: "#2b1405", a: "#fff8e7", b: "#c4601a" },
  { bg: "#a6d96a", fg: "#142108", a: "#fff8e7", b: "#6fa63a" },
];

function Art({ kind, a, b }: { kind: number; a: string; b: string }) {
  switch (kind) {
    case 0: return (<><circle cx="78" cy="30" r="34" fill={a} /><circle cx="14" cy="88" r="20" fill={b} /></>);
    case 1: return (<>{[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={-20 + i * 24} y="-20" width="9" height="160" fill={a} transform="rotate(30 50 50)" />)}</>);
    case 2: return (<><circle cx="70" cy="34" r="46" fill={b} /><circle cx="70" cy="34" r="32" fill={a} /><circle cx="70" cy="34" r="17" fill={b} /></>);
    case 3: return (<g transform="translate(75 28)">{Array.from({ length: 12 }).map((_, i) => <polygon key={i} points="0,0 120,-9 120,9" fill={i % 2 ? a : b} transform={`rotate(${i * 30})`} />)}</g>);
    case 4: return (<>{Array.from({ length: 5 }).flatMap((_, r) => Array.from({ length: 5 }).map((_, c) => <circle key={`${r}${c}`} cx={10 + c * 20 + (r % 2) * 10} cy={10 + r * 20} r="5" fill={(r + c) % 2 ? a : b} />))}</>);
    default: return (<><path d="M-10 70 Q30 30 60 60 T120 40 V120 H-10z" fill={a} /><path d="M-10 90 Q40 60 70 85 T120 75 V120 H-10z" fill={b} /></>);
  }
}

/** Generated cover for games with no uploaded thumbnail: a flat colour scheme, one bold shape, the title as a wordmark. */
export function Cover({ title, compact = false, bare = false }: { title: string; compact?: boolean; bare?: boolean }) {
  const h = hashStr(title);
  const s = SCHEMES[h % SCHEMES.length];
  const kind = hashStr(title + "~art") % 6;
  const len = title.length;
  const size = compact ? 0 : len <= 7 ? 24 : len <= 12 ? 18 : len <= 18 ? 14 : 11;
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: s.bg, color: s.fg, containerType: "inline-size" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden><Art kind={kind} a={s.a} b={s.b} /></svg>
      {bare ? null : compact ? (
        <span className="absolute inset-0 grid place-items-center display" style={{ fontSize: "60cqw" }}>{title.trim().charAt(0).toUpperCase()}</span>
      ) : (
        <span className="absolute left-[7cqw] right-[7cqw] bottom-[8cqw] display uppercase" style={{ fontSize: `${size}cqw`, lineHeight: 0.92, transform: "rotate(-3deg)", transformOrigin: "left bottom", overflowWrap: "anywhere" }}>
          {title}
        </span>
      )}
    </div>
  );
}

export function Art2({ game, compact, bare }: { game: Pick<Game, "title" | "thumbnail">; compact?: boolean; bare?: boolean }) {
  if (game.thumbnail) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={game.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />;
  }
  return <Cover title={game.title} compact={compact} bare={bare} />;
}
