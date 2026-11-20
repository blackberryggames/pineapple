"use client";
import { useChangelogs } from "@/lib/data";
import { Empty, Loading } from "@/components/Bits";
import { fmtDate } from "@/lib/util";
import type { ChangeKind } from "@/lib/types";

const KIND: Record<ChangeKind, { label: string; cls: string }> = {
  added: { label: "Added", cls: "bg-pine text-ink" },
  improved: { label: "Improved", cls: "bg-leaf text-ink" },
  fixed: { label: "Fixed", cls: "bg-cream text-ink" },
  removed: { label: "Removed", cls: "bg-hot text-ink" },
};

export default function Changelog() {
  const { data, loading } = useChangelogs();
  return (
    <div className="max-w-3xl">
      <h1 className="display text-4xl sm:text-5xl mb-10">Changelog</h1>
      {loading ? <Loading /> : data.length === 0 ? <Empty>No releases yet.</Empty> : (
        <ol className="space-y-12">
          {data.map((c) => (
            <li key={c.id} className="grid sm:grid-cols-[9rem_1fr] gap-x-8 gap-y-2">
              <div>
                <div className="display text-3xl text-pine">{c.version}</div>
                <div className="label mt-1">{fmtDate(c.createdAt)}</div>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{c.title}</h2>
                {c.summary && <p className="text-muted mt-1 whitespace-pre-wrap">{c.summary}</p>}
                <ul className="mt-4 space-y-2">
                  {c.entries.map((e, i) => (
                    <li key={i} className="flex gap-3 items-baseline">
                      <span className={`label !text-ink shrink-0 w-[4.5rem] text-center py-0.5 rounded-[2px] ${KIND[e.kind].cls}`}>{KIND[e.kind].label}</span>
                      <span>{e.text}</span>
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
