"use client";
import { useAnnouncements } from "@/lib/data";
import { Empty, Loading } from "@/components/Bits";
import { fmtDate } from "@/lib/util";

export default function News() {
  const { data, loading } = useAnnouncements();
  const sorted = [...data].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  return (
    <div className="max-w-2xl">
      <h1 className="display text-4xl sm:text-5xl mb-8">News</h1>
      {loading ? <Loading /> : sorted.length === 0 ? <Empty>No announcements yet.</Empty> : (
        <ul className="space-y-8">
          {sorted.map((a) => (
            <li key={a.id} className="border-l-4 border-pine pl-4">
              <div className="label">{fmtDate(a.createdAt)}{a.pinned ? " · pinned" : ""}</div>
              <h2 className="text-xl font-semibold mt-1">{a.title}</h2>
              <p className="mt-2 text-cream/90 whitespace-pre-wrap leading-relaxed">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
