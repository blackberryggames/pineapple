"use client";
import { useChangelogs } from "@/lib/data";
import { Empty, Loading } from "@/components/Bits";
import { fmtDate } from "@/lib/util";
import type { ChangeKind } from "@/lib/types";

const KIND: Record<ChangeKind, { label: string; cls: string }> = {
  added: { label: "Added", cls: "bg-pine text-ink" },
  improved: { label: "Improved", cls: "bg-leaf text-ink" },
  fixed: { label: "Fixed", cls: "bg-sky text-ink" },
  removed: { label: "Removed", cls: "bg-hot text-white" },
};

export default function Changelog() {
  const { data, loading } = useChangelogs();
  return (
    <div className="max-w-3xl">
      <h1 className="display text-4xl sm:text-5xl mb-10">Changelog</h1>
      {loading ? <Loading /> : data.length === 0 ? <Empty>No releases yet.</Empty> : (
        <ol className="space-y-5">
          {data.map((c) => (
            <li key={c.id} className="bg-card rounded-3xl p-5 sm:p-7 grid sm:grid-cols-[8rem_1fr] gap-x-8 gap-y-2">
              <div>
                <div className="display text-4xl"><span className="bg-pine rounded-xl px-3 py-0.5 inline-block">v{c.version}</span></div>
                <div className="label mt-1">{fmtDate(c.createdAt)}</div>
              </div>
              <div>
                <h2 className="display text-2xl">{c.title}</h2>
                {c.summary && <p className="text-muted font-semibold mt-1 whitespace-pre-wrap">{c.summary}</p>}
                <ul className="mt-4 space-y-2">
                  {c.entries.map((e, i) => (
                    <li key={i} className="flex gap-3 items-baseline">
                      <span className={`label !text-ink shrink-0 w-[4.8rem] text-center py-1 rounded-full ${KIND[e.kind].cls}`}>{KIND[e.kind].label}</span>
                      <span className="font-semibold">{e.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
