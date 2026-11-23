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
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const slash = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(t.tagName) && !t.isContentEditable) { e.preventDefault(); input.current?.focus(); }
      if (e.key === "Escape") { setOpen(false); input.current?.blur(); }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", slash);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", slash); };
  }, []);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return games.filter((g) => g.title.toLowerCase().includes(t) || (g.tags ?? []).some((x) => x.includes(t))).slice(0, 6);
  }, [q, games]);

  const go = (e?: React.FormEvent) => { e?.preventDefault(); setOpen(false); router.push(q.trim() ? `/games/?q=${encodeURIComponent(q.trim())}` : "/games/"); };
  const initial = (user?.displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-page border-b border-line">
      <div className="max-w-[1500px] mx-auto h-16 px-3 sm:px-5 flex items-center gap-3 sm:gap-6">
        <Link href="/" className="shrink-0 lg:w-56" aria-label="Pineapple Games home"><Logo /></Link>

        <div ref={wrap} className="relative flex-1 max-w-xl mx-auto">
          <form onSubmit={go} role="search" className="relative">
            <Icon name="search" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              ref={input} className="field !pl-10 !pr-10 !h-10 !py-0 !bg-sunk !border-transparent focus:!bg-card focus:!border-fg"
              type="search" placeholder="Search games" aria-label="Search games" value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
            />
            <kbd className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted border border-line rounded px-1.5 py-px bg-card">/</kbd>
          </form>
          {open && matches.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-2 card shadow-[0_20px_40px_-16px_rgba(31,28,21,.35)] p-1.5">
              {matches.map((g) => (
                <li key={g.id}>
                  <Link href={`/play/?id=${g.id}`} onClick={() => { setOpen(false); setQ(""); }} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-sunk">
                    <span className="w-9 h-9 rounded-lg overflow-hidden shrink-0 block"><Art2 game={g} compact /></span>
                    <span className="min-w-0"><span className="block text-sm font-semibold truncate">{g.title}</span><span className="text-xs text-muted">{g.category}</span></span>
                  </Link>
                </li>
              ))}
              <li className="border-t border-line mt-1 pt-1"><button onClick={() => go()} className="w-full text-left px-2 py-1.5 text-sm font-semibold text-link hover:underline underline-offset-4">All results for “{q}”</button></li>
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && <Link href="/admin/" className="btn btn-sm">Admin</Link>}
          {!loading && (user ? (
            <>
              <span title={user.email ?? ""} className="hidden sm:grid w-8 h-8 rounded-full bg-pine text-ink place-items-center text-sm font-bold">{initial}</span>
              <button className="btn btn-sm btn-ghost" onClick={() => signOut(auth)}>Sign out</button>
            </>
          ) : (
            <Link href="/login/" className="btn btn-sm btn-primary">Sign in</Link>
          ))}
        </div>
      </div>
    </header>
  );
}
