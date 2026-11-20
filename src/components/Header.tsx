"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { useGames } from "@/lib/data";
import Logo from "./Logo";
import Icon from "./Icon";
import { Art2 } from "./Cover";

export default function Header() {
  const { user, isAdmin, loading } = useAuth();
  const { data: games } = useGames();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return games.filter((g) => g.title.toLowerCase().includes(t) || (g.tags ?? []).some((x) => x.includes(t))).slice(0, 6);
  }, [q, games]);

  const go = (e: React.FormEvent) => { e.preventDefault(); setOpen(false); router.push(q.trim() ? `/games/?q=${encodeURIComponent(q.trim())}` : "/games/"); };
  const initial = (user?.displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-page/95 backdrop-blur-0 border-b-2 border-line">
      <div className="max-w-[1500px] mx-auto h-16 px-3 sm:px-5 flex items-center gap-3 sm:gap-6">
        <Link href="/" className="shrink-0 lg:w-56" aria-label="Pineapple Games home"><Logo /></Link>

        <div ref={wrap} className="relative flex-1 max-w-2xl mx-auto">
          <form onSubmit={go} role="search">
            <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              className="field !rounded-full !pl-11 !py-2.5 !bg-sunk !border-transparent focus:!bg-card"
              type="search" placeholder="Search games" aria-label="Search games" value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
            />
          </form>
          {open && matches.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-2 bg-card rounded-2xl shadow-[0_18px_40px_-12px_rgba(35,31,22,.45)] border-2 border-line p-2">
              {matches.map((g) => (
                <li key={g.id}>
                  <Link href={`/play/?id=${g.id}`} onClick={() => { setOpen(false); setQ(""); }} className="flex items-center gap-3 p-2 rounded-xl hover:bg-sunk">
                    <span className="w-10 h-10 rounded-lg overflow-hidden shrink-0 block"><Art2 game={g} compact /></span>
                    <span className="min-w-0"><span className="block font-extrabold truncate">{g.title}</span><span className="label">{g.category}</span></span>
                  </Link>
                </li>
              ))}
              <li><button onClick={go} className="w-full text-left p-2 text-sm font-extrabold text-link hover:underline">See all results for “{q}”</button></li>
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && <Link href="/admin/" className="btn btn-pine !px-4">Admin</Link>}
          {!loading && (user ? (
            <>
              <span title={user.email ?? ""} className="hidden sm:grid w-9 h-9 rounded-full bg-fg text-page place-items-center font-extrabold">{initial}</span>
              <button className="btn btn-ghost" onClick={() => signOut(auth)}>Sign out</button>
            </>
          ) : (
            <Link href="/login/" className="btn btn-pine">Sign in</Link>
          ))}
        </div>
      </div>
    </header>
  );
}
