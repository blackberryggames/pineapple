import { swatchFor } from "@/lib/util";
import type { Game } from "@/lib/types";

/* Real thumbnail if there is one; otherwise a flat colour block with the first letter, big. */
export default function Thumb({ game, className = "" }: { game: Pick<Game, "title" | "thumbnail">; className?: string }) {
  if (game.thumbnail) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={game.thumbnail} alt="" className={`w-full h-full object-cover ${className}`} loading="lazy" />;
  }
  const [bg, fg] = swatchFor(game.title);
  return (
    <div className={`w-full h-full flex items-end p-3 overflow-hidden ${className}`} style={{ background: bg, color: fg }}>
      <span className="display text-6xl sm:text-7xl leading-none -mb-2 -ml-1 select-none">{game.title.trim().charAt(0).toUpperCase()}</span>
    </div>
  );
}
