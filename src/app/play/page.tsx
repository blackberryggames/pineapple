"use client";
import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MOCK } from "@/lib/mock";
import { useDoc, useGames } from "@/lib/data";
import type { Game } from "@/lib/types";
import Player from "@/components/Player";
import { Comments, LikeButton } from "@/components/Engage";
import Tile from "@/components/Tile";
import { Empty, Loading } from "@/components/Bits";

function Play() {
  const id = useSearchParams().get("id");
  const { data: game, loading } = useDoc<Game>("games", id);
  const { data: all } = useGames();

  // count one play per browser session
  useEffect(() => {
    if (!id || !game || MOCK) return;
    try {
      const k = `played:${id}`;
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {}
    updateDoc(doc(db, "games", id), { playCount: increment(1) }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, !!game]);

  // same category first, then fill with whatever is newest
  const more = useMemo(() => {
    if (!game) return [];
    const others = all.filter((g) => g.id !== game.id);
    return [...others.filter((g) => g.category === game.category), ...others.filter((g) => g.category !== game.category)].slice(0, 12);
  }, [all, game]);

  useEffect(() => { if (game) document.title = `${game.title} · Pineapple Games`; }, [game]);

  if (loading) return <Loading />;
  if (!game) return <Empty>Game not found. It may have been removed.</Empty>;

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_21rem] gap-8">
      <div className="min-w-0 space-y-8">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h1 className="display text-4xl sm:text-5xl">{game.title}</h1>
              <div className="label mt-2">{game.category} · {(game.playCount ?? 0).toLocaleString()} plays</div>
            </div>
            <LikeButton gameId={game.id} count={game.likeCount ?? 0} />
          </div>
          <Player game={game} />
        </div>

        {(game.description || game.controls || game.tags?.length > 0) && (
          <section className="bg-card rounded-3xl p-5 sm:p-6 grid sm:grid-cols-2 gap-6">
            {game.description && <div><div className="label mb-1.5">About</div><p className="font-medium leading-relaxed whitespace-pre-wrap">{game.description}</p></div>}
            {game.controls && <div><div className="label mb-1.5">Controls</div><p className="font-medium leading-relaxed whitespace-pre-wrap">{game.controls}</p></div>}
            {game.tags?.length > 0 && <div className="sm:col-span-2 flex flex-wrap gap-1.5">{game.tags.map((t) => <span key={t} className="text-xs font-extrabold bg-sunk rounded-full px-3 py-1">{t}</span>)}</div>}
          </section>
        )}

        <div className="max-w-2xl"><Comments gameId={game.id} /></div>
      </div>

      <aside>
        <h2 className="display text-2xl mb-3">More games</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-2 gap-3">
          {more.map((g) => <Tile key={g.id} game={g} />)}
        </div>
      </aside>
    </div>
  );
}
export default function PlayPage() { return <Suspense fallback={<Loading />}><Play /></Suspense>; }
