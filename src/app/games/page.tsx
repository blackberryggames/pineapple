"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGames } from "@/lib/data";
import Tile from "@/components/Tile";
import { Empty, Loading } from "@/components/Bits";

type Sort = "new" | "popular" | "liked" | "az";
const SORTS: [Sort, string][] = [["new", "Newest"], ["popular", "Most played"], ["liked", "Most liked"], ["az", "A to Z"]];

function Browse() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: games, loading, error } = useGames();
  const cat = params.get("cat") ?? "All";
  const sort = (params.get("sort") as Sort) || "new";
  const [q, setQ] = useState(params.get("q") ?? "");
  useEffect(() => setQ(params.get("q") ?? ""), [params]);

  const set = (k: string, v: string | null) => {
    const p = new URLSearchParams(params.toString());
    if (v) p.set(k, v); else p.delete(k);
    router.replace(`/games/?${p.toString()}`);
  };

  const cats = useMemo(() => ["All", ...Array.from(new Set(games.map((g) => g.category))).sort()], [games]);
  const shown = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = games.filter((g) => {
      if (cat !== "All" && g.category !== cat) return false;
      const hay = `${g.title} ${g.description} ${g.category} ${(g.tags ?? []).join(" ")}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
    const by: Record<Sort, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
      new: () => 0,
      popular: (a, b) => (b.playCount ?? 0) - (a.playCount ?? 0),
      liked: (a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0),
      az: (a, b) => a.title.localeCompare(b.title),
    };
    return [...list].sort(by[sort]);
  }, [games, q, cat, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <h1 className="display text-4xl sm:text-5xl">{q ? <>Results for “{q}”</> : cat === "All" ? "All games" : cat}</h1>
        <span className="label pb-1">{shown.length} game{shown.length === 1 ? "" : "s"}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
        <div className="flex gap-2 overflow-x-auto hide-scroll flex-1 -mx-1 px-1">
          {cats.map((c) => <button key={c} className="chip" aria-pressed={cat === c} onClick={() => set("cat", c === "All" ? null : c)}>{c}</button>)}
        </div>
        <select className="field md:!w-44 !py-1.5 !rounded-full" value={sort} onChange={(e) => set("sort", e.target.value)} aria-label="Sort games">
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : error ? <Empty>Couldn&apos;t load games: {error}</Empty> : shown.length === 0 ? (
        <Empty>{games.length === 0 ? "No games added yet." : "Nothing matches that. Try another word or category."}</Empty>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
          {shown.map((g) => <Tile key={g.id} game={g} />)}
        </div>
      )}
    </div>
  );
}
export default function GamesPage() { return <Suspense fallback={<Loading />}><Browse /></Suspense>; }
