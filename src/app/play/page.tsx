"use client";
import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useDoc, useGames } from "@/lib/data";
import type { Game } from "@/lib/types";
import Player from "@/components/Player";
import { Comments, LikeButton } from "@/components/Engage";
import GameTile from "@/components/GameTile";
import { Empty, Loading, SectionHead } from "@/components/Bits";

function Play() {
  const id = useSearchParams().get("id");
  const { data: game, loading } = useDoc<Game>("games", id);
  const { data: all } = useGames();

  // count one play per browser session
  useEffect(() => {
    if (!id || !game) return;
    try {
      const k = `played:${id}`;
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {}
    updateDoc(doc(db, "games", id), { playCount: increment(1) }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, !!game]);

  const more = useMemo(() => all.filter((g) => g.id !== id && game && g.category === game.category).slice(0, 4), [all, id, game]);

  useEffect(() => { if (game) document.title = `${game.title} · Pineapple Games`; }, [game]);

  if (loading) return <Loading />;
  if (!game) return <Empty>Game not found. It may have been removed.</Empty>;

  return (
    <div className="space-y-10">
      <div className="grid xl:grid-cols-[1fr_18rem] gap-8">
        <div>
          <h1 className="display text-3xl sm:text-5xl mb-4">{game.title}</h1>
          <Player game={game} />
        </div>
        <aside className="space-y-5 xl:pt-[4.5rem]">
          <LikeButton gameId={game.id} count={game.likeCount ?? 0} />
          <div className="label">{game.category} · {game.playCount ?? 0} plays</div>
          {game.description && <p className="leading-relaxed whitespace-pre-wrap">{game.description}</p>}
          {game.controls && (
            <div>
              <div className="label mb-1">Controls</div>
              <p className="text-sm whitespace-pre-wrap border-2 border-line rounded-[3px] p-3 bg-panel">{game.controls}</p>
            </div>
          )}
          {game.tags?.length > 0 && <div className="flex flex-wrap gap-1.5">{game.tags.map((t) => <span key={t} className="label border border-line rounded-[2px] px-1.5 py-0.5">{t}</span>)}</div>}
        </aside>
      </div>

      <div className="max-w-2xl"><Comments gameId={game.id} /></div>

      {more.length > 0 && (
        <section>
          <SectionHead title={`More ${game.category}`} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{more.map((g) => <GameTile key={g.id} game={g} />)}</div>
        </section>
      )}
    </div>
  );
}
export default function PlayPage() { return <Suspense fallback={<Loading />}><Play /></Suspense>; }
