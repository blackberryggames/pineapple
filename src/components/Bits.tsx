"use client";
import Link from "next/link";
import { useRef } from "react";
import type { Game } from "@/lib/types";
import Icon from "./Icon";
import Tile from "./Tile";

export function SectionHead({ title, href, linkText = "See all", right }: { title: string; href?: string; linkText?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="title text-xl">{title}</h2>
      <div className="flex items-center gap-3">
        {right}
        {href && <Link href={href} className="flex items-center gap-0.5 text-sm font-semibold text-muted hover:text-fg">{linkText}<Icon name="chev" size={15} /></Link>}
      </div>
    </div>
  );
}

/** Horizontal row of tiles with arrow buttons. */
export function Shelf({ title, href, games }: { title: string; href?: string; games: Game[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section>
      <SectionHead
        title={title} href={href}
        right={
          <div className="hidden md:flex gap-1">
            <button className="btn btn-icon btn-sm" onClick={() => scroll(-1)} aria-label="Scroll left"><Icon name="chevl" size={16} /></button>
            <button className="btn btn-icon btn-sm" onClick={() => scroll(1)} aria-label="Scroll right"><Icon name="chev" size={16} /></button>
          </div>
        }
      />
      <div className="shelf" ref={ref}>{games.map((g) => <Tile key={g.id} game={g} className="w-36 sm:w-44" />)}</div>
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="card border-dashed p-10 text-center text-muted font-medium">{children}</div>;
}
export function Loading() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-pulse" aria-label="Loading">
      {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-sunk" />)}
    </div>
  );
}
