"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { usePages } from "@/lib/data";
import { CATEGORIES } from "@/lib/util";
import Icon from "./Icon";

const DOTS = ["#ffc21a", "#2f9e5b", "#f0532f", "#2d9cdb", "#f7a8c4", "#ff8a3d", "#a6d96a", "#231f16", "#b9ad8a"];

export function useNav() {
  const { data: pages } = usePages();
  const top = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/games/", label: "All games", icon: "grid" },
    { href: "/games/?sort=new", label: "New", icon: "spark" },
    { href: "/games/?sort=popular", label: "Popular", icon: "flame" },
  ];
  const more = [
    { href: "/news/", label: "News", icon: "news" },
    { href: "/changelog/", label: "Changelog", icon: "log" },
    ...pages.filter((p) => p.inNav).map((p) => ({ href: `/p/?slug=${p.id}`, label: p.title, icon: "page" })),
  ];
  return { top, more };
}

function useActive() {
  const path = usePathname();
  const sp = useSearchParams();
  return (href: string) => {
    const [p, qs] = href.split("?");
    if (p !== path) return false;
    if (!qs) return p !== "/games/" || (!sp.get("sort") && !sp.get("cat"));
    const [k, v] = qs.split("=");
    return sp.get(k) === v;
  };
}

export function Sidebar() {
  const { top, more } = useNav();
  const active = useActive();
  const link = (it: { href: string; label: string; icon: string }) => (
    <Link key={it.href} href={it.href} aria-current={active(it.href) ? "page" : undefined}
      className={`flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-semibold transition-colors ${active(it.href) ? "bg-sunk text-fg" : "text-fg/75 hover:bg-sunk hover:text-fg"}`}>
      <Icon name={it.icon} size={18} className={active(it.href) ? "text-link" : "text-muted"} />{it.label}
    </Link>
  );
  return (
    <aside className="hidden lg:block w-56 shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto py-5 pl-4 pr-3">
      <nav className="space-y-0.5">{top.map(link)}</nav>
      <div className="label px-3 mt-6 mb-1.5">Categories</div>
      <nav className="space-y-0.5">
        {CATEGORIES.map((c, i) => {
          const href = `/games/?cat=${encodeURIComponent(c)}`;
          return (
            <Link key={c} href={href} aria-current={active(href) ? "page" : undefined}
              className={`flex items-center gap-3 px-3 h-8 rounded-lg text-sm font-medium ${active(href) ? "bg-sunk text-fg font-semibold" : "text-fg/75 hover:bg-sunk hover:text-fg"}`}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DOTS[i % DOTS.length] }} />{c}
            </Link>
          );
        })}
      </nav>
      <div className="h-px bg-line my-4 mx-3" />
      <nav className="space-y-0.5">{more.map(link)}</nav>
    </aside>
  );
}

export function MobileNav() {
  const { top, more } = useNav();
  const active = useActive();
  const items = [...top, ...CATEGORIES.map((c) => ({ href: `/games/?cat=${encodeURIComponent(c)}`, label: c, icon: "" })), ...more];
  return (
    <nav className="lg:hidden flex gap-2 overflow-x-auto hide-scroll px-3 sm:px-5 py-2.5 border-b border-line bg-page">
      {items.map((it) => <Link key={it.href} href={it.href} className="chip" aria-pressed={active(it.href)}>{it.label}</Link>)}
    </nav>
  );
}
