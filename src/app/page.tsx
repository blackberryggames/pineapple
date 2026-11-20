"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useGames, useAnnouncements, useDoc } from "@/lib/data";
import type { Page } from "@/lib/types";
import Tile from "@/components/Tile";
import Blocks from "@/components/Blocks";
import Icon from "@/components/Icon";
import { SectionHead, Empty, Loading } from "@/components/Bits";

const score = (g: { playCount?: number; likeCount?: number }) => (g.playCount ?? 0) + (g.likeCount ?? 0) * 8;

export default function Home() {
  const { data: games, loading } = useGames();
  const { data: news } = useAnnouncements();
  const { data: intro } = useDoc<Page>("pages", "home");

  const featured = useMemo(() => games.find((g) => g.featured) ?? games[0], [games]);
  const beside = useMemo(() => games.filter((g) => g.id !== featured?.id).slice(0, 4), [games, featured]);
  const newest = useMemo(() => games.slice(0, 12), [games]);
  const popular = useMemo(() => [...games].sort((a, b) => score(b) - score(a)).slice(0, 12), [games]);
  const cats = useMemo(() => {
    const m = new Map<string, typeof games>();
    games.forEach((g) => m.set(g.category, [...(m.get(g.category) ?? []), g]));
    return [...m.entries()].filter(([, l]) => l.length >= 3).sort((a, b) => b[1].length - a[1].length).slice(0, 3);
  }, [games]);
  const notice = useMemo(() => news.find((n) => n.pinned) ?? news[0], [news]);

  if (loading) return <Loading />;
  if (!games.length) return <Empty>No games yet. Sign in as the admin, open Admin, and add some (there&apos;s a one-click starter pack).</Empty>;

  return (
    <div className="space-y-10">
      {notice && (
        <Link href="/news/" className="flex items-center gap-3 bg-pine rounded-2xl px-4 py-3 hover:brightness-95">
          <Icon name="news" size={20} />
          <span className="font-extrabold truncate">{notice.title}</span>
          <span className="hidden sm:block text-sm font-semibold text-ink/70 truncate">{notice.body}</span>
          <Icon name="chev" size={18} className="ml-auto shrink-0" />
        </Link>
      )}

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {featured && (
          <div className="col-span-2 row-span-2 relative">
            <Tile game={featured} big className="w-full" />
            <span className="absolute top-3 left-3 bg-ink text-pine text-xs font-extrabold uppercase tracking-wider rounded-full px-3 py-1 pointer-events-none z-10">{featured.featured ? "Featured" : "Latest"}</span>
          </div>
        )}
        {beside.map((g) => <Tile key={g.id} game={g} />)}
      </section>

      <section>
        <SectionHead title="New games" href="/games/?sort=new" />
        <div className="shelf">{newest.map((g) => <Tile key={g.id} game={g} className="w-36 sm:w-44" />)}</div>
      </section>

      <section>
        <SectionHead title="Most played" href="/games/?sort=popular" />
        <div className="shelf">{popular.map((g) => <Tile key={g.id} game={g} className="w-36 sm:w-44" />)}</div>
      </section>

      {cats.map(([cat, list]) => (
        <section key={cat}>
          <SectionHead title={cat} href={`/games/?cat=${encodeURIComponent(cat)}`} />
          <div className="shelf">{list.slice(0, 12).map((g) => <Tile key={g.id} game={g} className="w-36 sm:w-44" />)}</div>
        </section>
      ))}

      {intro && intro.blocks?.length > 0 && <section className="bg-card rounded-3xl p-6 sm:p-10"><Blocks blocks={intro.blocks} /></section>}
    </div>
  );
}
