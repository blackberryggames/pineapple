"use client";
import { useAnnouncements } from "@/lib/data";
import { Empty, Loading } from "@/components/Bits";
import { fmtDate } from "@/lib/util";

export default function News() {
  const { data, loading } = useAnnouncements();
  const sorted = [...data].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  return (
    <div className="max-w-3xl">
      <h1 className="title text-3xl sm:text-4xl">News</h1>
      <p className="text-muted mt-1.5 mb-8">Updates, new games and what&apos;s coming next.</p>
      {loading ? <Loading /> : sorted.length === 0 ? <Empty>No announcements yet.</Empty> : (
        <ul className="divide-y divide-line border-y border-line">
          {sorted.map((a) => (
            <li key={a.id} className="grid sm:grid-cols-[9rem_1fr] gap-x-8 gap-y-1 py-6">
              <div className="text-sm font-medium text-muted pt-1">{fmtDate(a.createdAt)}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="title text-xl">{a.title}</h2>
                  {a.pinned && <span className="bg-pine text-ink text-[11px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5">Pinned</span>}
                </div>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-fg/85">{a.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
