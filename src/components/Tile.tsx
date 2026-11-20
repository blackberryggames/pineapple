import Link from "next/link";
import type { Game } from "@/lib/types";
import { Art2 } from "./Cover";
import Icon from "./Icon";

/** Square game tile. With a real thumbnail the title sits on a scrim; generated covers carry their own title. */
export default function Tile({ game, className = "", big = false }: { game: Game; className?: string; big?: boolean }) {
  return (
    <Link href={`/play/?id=${game.id}`} className={`tile group aspect-square ${className}`} aria-label={game.title}>
      <Art2 game={game} />
      {game.thumbnail && (
        <div className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-black/75 to-transparent">
          <span className={`display text-white leading-tight block ${big ? "text-3xl" : "text-base"} line-clamp-2`}>{game.title}</span>
        </div>
      )}
      <span className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 text-fg text-xs font-extrabold rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
        <Icon name="heart" size={12} fill className="text-hot" />{game.likeCount ?? 0}
      </span>
      <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25" aria-hidden>
        <span className="w-12 h-12 rounded-full bg-pine text-ink grid place-items-center shadow-lg"><Icon name="play" size={22} fill /></span>
      </span>
    </Link>
  );
}
