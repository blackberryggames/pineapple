"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGames } from "@/lib/data";
import GameTile from "@/components/GameTile";
import { Empty, Loading } from "@/components/Bits";

type Sort = "new" | "popular" | "liked" | "az";

function Browse() {
  const params = useSearchParams();
  const { data: games, loading, error } = useGames();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<Sort>("new");
  useEffect(() => setQ(params.get("q") ?? ""), [params]);

  const cats = useMemo(() => ["All", ...Array.from(new Set(games.map((g) => g.category))).sort()], [games]);
  const shown = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = games.filter((g) => {
      if (cat !== "All" && g.category !== cat) return false;
      const hay = `${g.title} ${g.description} ${g.category} ${(g.tags ?? []).join(" ")}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
    const by: Record<Sort, (a: typeof list[0], b: typeof list[0]) => number> = {
      new: () => 0,
      popular: (a, b) => (b.playCount ?? 0) - (a.playCount ?? 0),
      liked: (a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0),
      az: (a, b) => a.title.localeCompare(b.title),
    };
    return [...list].sort(by[sort]);
  }, [games, q, cat, sort]);

  return (
    <div>
      <h1 className="display text-4xl sm:text-5xl mb-6">Games</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input className="field sm:max-w-sm" type="search" placeholder="Search by name, category or tag" value={q} onChange={(e) => setQ(e.target.value)} autoFocus={!!params.get("q")} />
        <select className="field sm:w-48" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
          <option value="new">Newest</option><option value="popular">Most played</option><option value="liked">Most liked</option><option value="az">A to Z</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {cats.map((c) => <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      {loading ? <Loading /> : error ? <Empty>Couldn&apos;t load games: {error}</Empty> : shown.length === 0 ? (
        <Empty>{games.length === 0 ? "No games added yet." : `Nothing matches “${q}”.`}</Empty>
      ) : (
        <>
          <div className="label mb-3">{shown.length} game{shown.length === 1 ? "" : "s"}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{shown.map((g) => <GameTile key={g.id} game={g} />)}</div>
        </>
      )}
    </div>
  );
}
export default function GamesPage() { return <Suspense fallback={<Loading />}><Browse /></Suspense>; }
