import type { Block } from "@/lib/types";

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, i) => /^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noopener noreferrer">{p}</a> : p);
}

export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "heading": return <h2 key={i} className="display text-3xl sm:text-4xl pt-2">{b.text}</h2>;
          case "text": return <div key={i} className="prose-plain max-w-2xl text-[1.02rem]">{b.text.split(/\n{2,}/).map((para, j) => <p key={j}>{linkify(para)}</p>)}</div>;
          case "image": return (
            <figure key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.src} alt={b.caption ?? ""} className="max-w-full border-2 border-line rounded-[3px]" />
              {b.caption && <figcaption className="label mt-2">{b.caption}</figcaption>}
            </figure>
          );
          case "link": return <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className="btn btn-pine">{b.label}</a>;
          case "embed": return <iframe key={i} src={b.url} className="w-full border-2 border-line rounded-[3px] bg-white" style={{ height: b.height ?? 480 }} allowFullScreen sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />;
        }
      })}
    </div>
  );
}
