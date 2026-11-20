import Link from "next/link";
import Icon from "./Icon";

export function SectionHead({ title, href, linkText = "See all" }: { title: string; href?: string; linkText?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="display text-2xl sm:text-[1.7rem]">{title}</h2>
      {href && <Link href={href} className="flex items-center gap-0.5 text-sm font-extrabold text-link hover:underline underline-offset-4">{linkText}<Icon name="chev" size={16} /></Link>}
    </div>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="bg-sunk rounded-3xl p-10 text-center text-muted font-semibold">{children}</div>;
}
export function Loading() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-pulse" aria-label="Loading">
      {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-square rounded-[18px] bg-sunk" />)}
    </div>
  );
}
