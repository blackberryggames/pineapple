"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useGames, useAnnouncements, useDoc } from "@/lib/data";
import type { Page } from "@/lib/types";
import GameTile from "@/components/GameTile";
import Thumb from "@/components/Thumb";
import Blocks from "@/components/Blocks";
import { SectionHead, Empty, Loading } from "@/components/Bits";
import { fmtDate } from "@/lib/util";

export default function Home() {
  const { data: games, loading } = useGames();
  const { data: news } = useAnnouncements();
  const { data: intro } = useDoc<Page>("pages", "home");

  const featured = useMemo(() => games.find((g) => g.featured) ?? games[0], [games]);
  const latest = useMemo(() => games.filter((g) => g.id !== featured?.id).slice(0, 8), [games, featured]);
  const popular = useMemo(() => [...games].sort((a, b) => (b.playCount ?? 0) + (b.likeCount ?? 0) * 3 - ((a.playCount ?? 0) + (a.likeCount ?? 0) * 3)).slice(0, 4), [games]);
  const pinned = useMemo(() => [...news].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned)).slice(0, 3), [news]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-14">
      <section className="grid lg:grid-cols-[1fr_20rem] gap-8">
        {featured ? (
          <Link href={`/play/?id=${featured.id}`} className="tile group block overflow-hidden">
            <div className="aspect-[16/9] sm:aspect-[2/1] border-b-2 border-line relative">
              <Thumb game={featured} />
            </div>
            <div className="p-5 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="label mb-2">{featured.featured ? "Featured" : "Newest"} · {featured.category}</div>
                <h1 className="display text-4xl sm:text-5xl truncate group-hover:text-pine">{featured.title}</h1>
                <p className="text-muted mt-2 line-clamp-2 max-w-xl">{featured.description}</p>
              </div>
              <span className="btn btn-pine shrink-0">Play</span>
            </div>
          </Link>
        ) : (
          <Empty>No games yet. Sign in as admin and add the first one.</Empty>
        )}

        <aside>
          <div className="label mb-3">Notice board</div>
          {pinned.length === 0 ? <p className="text-muted text-sm">Nothing posted yet.</p> : (
            <ul className="space-y-4">
              {pinned.map((a) => (
                <li key={a.id} className="border-l-4 border-pine pl-3">
                  <div className="label">{fmtDate(a.createdAt)}{a.pinned ? " · pinned" : ""}</div>
                  <div className="font-semibold mt-0.5">{a.title}</div>
                  <p className="text-sm text-muted mt-1 line-clamp-3 whitespace-pre-wrap">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/news/" className="text-sm text-pine underline underline-offset-4 mt-4 inline-block">All news</Link>
        </aside>
      </section>

      {intro && intro.blocks?.length > 0 && <section><Blocks blocks={intro.blocks} /></section>}

      {latest.length > 0 && (
        <section>
          <SectionHead title="Just added" right={<Link href="/games/" className="text-sm text-pine underline underline-offset-4">Browse all {games.length}</Link>} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{latest.map((g) => <GameTile key={g.id} game={g} />)}</div>
        </section>
      )}

      {games.length > 4 && (
        <section>
          <SectionHead title="Most played" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{popular.map((g) => <GameTile key={g.id} game={g} />)}</div>
        </section>
      )}
    </div>
  );
}
