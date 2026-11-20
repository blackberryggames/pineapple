"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { usePages } from "@/lib/data";

export default function Header() {
  const { user, isAdmin, loading } = useAuth();
  const { data: pages } = usePages();
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <header className="border-b-2 border-line sticky top-0 z-40 bg-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="mark w-7 h-7 rounded-[3px] block" />
          <span className="display text-xl hidden sm:block">PINEAPPLE</span>
        </Link>

        <form
          className="flex-1 max-w-md"
          role="search"
          onSubmit={(e) => { e.preventDefault(); router.push(q.trim() ? `/games/?q=${encodeURIComponent(q.trim())}` : "/games/"); }}
        >
          <input className="field" type="search" placeholder="Search games" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search games" />
        </form>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium ml-auto">
          <Link href="/games/" className="hover:text-pine">Games</Link>
          <Link href="/news/" className="hover:text-pine">News</Link>
          <Link href="/changelog/" className="hover:text-pine">Changelog</Link>
          {pages.filter((p) => p.inNav).map((p) => (
            <Link key={p.id} href={`/p/?slug=${p.id}`} className="hover:text-pine">{p.title}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto md:ml-0 shrink-0">
          {isAdmin && <Link href="/admin/" className="btn btn-pine">Admin</Link>}
          {!loading && (user ? (
            <button className="btn btn-ghost" onClick={() => signOut(auth)} title={user.email ?? ""}>Sign out</button>
          ) : (
            <Link href="/login/" className="btn">Sign in</Link>
          ))}
        </div>
      </div>
      <nav className="md:hidden border-t-2 border-line flex gap-5 px-4 py-2 text-sm font-medium overflow-x-auto">
        <Link href="/games/">Games</Link><Link href="/news/">News</Link><Link href="/changelog/">Changelog</Link>
        {pages.filter((p) => p.inNav).map((p) => <Link key={p.id} href={`/p/?slug=${p.id}`}>{p.title}</Link>)}
      </nav>
    </header>
  );
}
