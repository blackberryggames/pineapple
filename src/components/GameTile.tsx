import Link from "next/link";
import type { Game } from "@/lib/types";
import Thumb from "./Thumb";

export default function GameTile({ game }: { game: Game }) {
  return (
    <Link href={`/play/?id=${game.id}`} className="tile block group">
      <div className="aspect-[4/3] border-b-2 border-line overflow-hidden"><Thumb game={game} /></div>
      <div className="p-3">
        <h3 className="font-semibold leading-snug truncate group-hover:text-pine">{game.title}</h3>
        <div className="mt-1 flex items-center justify-between label">
          <span>{game.category}</span>
          <span>♥ {game.likeCount ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}
