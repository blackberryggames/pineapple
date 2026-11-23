"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useGames, useAnnouncements, useDoc } from "@/lib/data";
import type { Page } from "@/lib/types";
import Blocks from "@/components/Blocks";
import Icon from "@/components/Icon";
import { Art2 } from "@/components/Cover";
import { Shelf, SectionHead, Empty, Loading } from "@/components/Bits";

const score = (g: { playCount?: number; likeCount?: number }) => (g.playCount ?? 0) + (g.likeCount ?? 0) * 8;

export default function Home() {
  const { data: games, loading } = useGames();
  const { data: news } = useAnnouncements();
  const { data: intro } = useDoc<Page>("pages", "home");

  const featured = useMemo(() => games.find((g) => g.featured) ?? games[0], [games]);
  const popular = useMemo(() => [...games].sort((a, b) => score(b) - score(a)), [games]);
  const trending = useMemo(() => popular.filter((g) => g.id !== featured?.id).slice(0, 5), [popular, featured]);
  const cats = useMemo(() => {
    const m = new Map<string, typeof games>();
    games.forEach((g) => m.set(g.category, [...(m.get(g.category) ?? []), g]));
    return [...m.entries()].filter(([, l]) => l.length >= 3).sort((a, b) => b[1].length - a[1].length).slice(0, 3);
  }, [games]);
  const notice = useMemo(() => news.find((n) => n.pinned) ?? news[0], [news]);

  if (loading) return <Loading />;
  if (!games.length) return <Empty>No games yet. Sign in as the admin, open Admin, and add some. There&apos;s a one-click starter pack.</Empty>;

  return (
    <div className="space-y-10">
      {notice && (
        <Link href="/news/" className="card flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sunk transition-colors">
          <span className="bg-pine text-ink text-[11px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5">News</span>
          <span className="font-semibold truncate">{notice.title}</span>
          <span className="hidden sm:block text-muted truncate">{notice.body}</span>
          <Icon name="chev" size={16} className="ml-auto shrink-0 text-muted" />
        </Link>
      )}

      <section className="grid xl:grid-cols-[minmax(0,1fr)_21rem] gap-5">
        {featured && (
          <div className="relative rounded-3xl overflow-hidden bg-black min-h-[18rem] flex items-end">
            <div className="absolute inset-0 scale-125 blur-2xl opacity-80"><Art2 game={featured} bare={!featured.thumbnail} /></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="relative w-full p-6 sm:p-9 flex items-end justify-between gap-6">
              <div className="max-w-md">
                <div className="text-[11px] font-bold uppercase tracking-widest text-pine mb-3">{featured.featured ? "Featured" : "Latest"} · {featured.category}</div>
                <h1 className="display text-4xl sm:text-6xl text-white">{featured.title}</h1>
                {featured.description && <p className="text-white/75 mt-3 line-clamp-2 font-medium">{featured.description}</p>}
                <div className="flex items-center gap-3 mt-6">
                  <Link href={`/play/?id=${featured.id}`} className="btn btn-pine !h-11 !px-6 !text-base"><Icon name="play" size={18} fill />Play now</Link>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-white/80"><Icon name="heart" size={16} fill />{featured.likeCount ?? 0}</span>
                </div>
              </div>
              <Link href={`/play/?id=${featured.id}`} className="absolute top-5 right-5 w-24 md:static md:w-44 lg:w-52 aspect-square rounded-2xl md:rounded-3xl overflow-hidden rotate-3 hover:rotate-0 transition-transform shadow-2xl shrink-0" aria-label={featured.title}>
                <Art2 game={featured} />
              </Link>
            </div>
          </div>
        )}

        {trending.length > 0 && (
          <div className="card p-2 self-start xl:self-stretch">
            <div className="flex items-center justify-between px-3 pt-2 pb-1"><h2 className="title text-lg">Trending</h2><Link href="/games/?sort=popular" className="text-sm font-semibold text-muted hover:text-fg">All</Link></div>
            <ol>
              {trending.map((g, i) => (
                <li key={g.id}>
                  <Link href={`/play/?id=${g.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-sunk transition-colors">
                    <span className="w-5 text-center text-sm font-bold text-muted tabular-nums">{i + 1}</span>
                    <span className="w-12 h-12 rounded-xl overflow-hidden shrink-0 block"><Art2 game={g} compact /></span>
                    <span className="min-w-0 flex-1"><span className="block font-semibold truncate">{g.title}</span><span className="text-xs text-muted">{g.category} · {(g.playCount ?? 0).toLocaleString()} plays</span></span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <Shelf title="New games" href="/games/?sort=new" games={games.slice(0, 14)} />
      <Shelf title="Most played" href="/games/?sort=popular" games={popular.slice(0, 14)} />
      {cats.map(([cat, list]) => <Shelf key={cat} title={cat} href={`/games/?cat=${encodeURIComponent(cat)}`} games={list.slice(0, 14)} />)}

      {intro && intro.blocks?.length > 0 && <section className="card p-6 sm:p-10"><Blocks blocks={intro.blocks} /></section>}
    </div>
  );
}
