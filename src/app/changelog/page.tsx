"use client";
import { useChangelogs } from "@/lib/data";
import { Empty, Loading } from "@/components/Bits";
import { fmtDate } from "@/lib/util";
import type { ChangeKind } from "@/lib/types";

const KIND: Record<ChangeKind, { label: string; cls: string }> = {
  added: { label: "Added", cls: "bg-[#fff1c2] text-[#6b4a00]" },
  improved: { label: "Improved", cls: "bg-[#dcf1e3] text-[#17572f]" },
  fixed: { label: "Fixed", cls: "bg-[#dcecf8] text-[#17517a]" },
  removed: { label: "Removed", cls: "bg-[#fbe0da] text-[#8a2512]" },
};

export default function Changelog() {
  const { data, loading } = useChangelogs();
  return (
    <div className="max-w-3xl">
      <h1 className="title text-3xl sm:text-4xl">Changelog</h1>
      <p className="text-muted mt-1.5 mb-10">Everything that&apos;s changed on the site, newest first.</p>
      {loading ? <Loading /> : data.length === 0 ? <Empty>No releases yet.</Empty> : (
        <ol className="relative border-l border-line ml-1.5 space-y-12">
          {data.map((c, i) => (
            <li key={c.id} className="pl-8 relative">
              <span className={`absolute -left-[5px] top-2 w-[9px] h-[9px] rounded-full ${i === 0 ? "bg-pine ring-4 ring-pine/25" : "bg-line"}`} />
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-sm font-bold bg-fg text-page rounded-md px-2 py-0.5">v{c.version}</span>
                <span className="text-sm font-medium text-muted">{fmtDate(c.createdAt)}</span>
              </div>
              <h2 className="title text-2xl mt-3">{c.title}</h2>
              {c.summary && <p className="text-muted mt-1.5 whitespace-pre-wrap">{c.summary}</p>}
              <ul className="mt-4 space-y-2.5">
                {c.entries.map((e, j) => (
                  <li key={j} className="flex gap-3 items-baseline">
                    <span className={`text-[11px] font-bold uppercase tracking-wide shrink-0 w-[4.75rem] text-center py-0.5 rounded ${KIND[e.kind].cls}`}>{KIND[e.kind].label}</span>
                    <span className="leading-snug">{e.text}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
