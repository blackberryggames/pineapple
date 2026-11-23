"use client";
import { useState } from "react";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { usePages } from "@/lib/data";
import type { Block, Page } from "@/lib/types";
import { slugify } from "@/lib/util";
import { Field, ImagePicker, Status } from "./common";

const ADD: { type: Block["type"]; label: string }[] = [
  { type: "heading", label: "Heading" }, { type: "text", label: "Text" }, { type: "image", label: "Image" },
  { type: "link", label: "Button" }, { type: "embed", label: "Embed" },
];
const fresh = (t: Block["type"]): Block =>
  t === "heading" ? { type: t, text: "" } : t === "text" ? { type: t, text: "" } : t === "image" ? { type: t, src: "" } :
  t === "link" ? { type: t, label: "", url: "" } : { type: "embed", url: "", height: 480 };

export default function PagesAdmin() {
  const { data } = usePages();
  const [slug, setSlug] = useState(""); const [title, setTitle] = useState(""); const [inNav, setInNav] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editing, setEditing] = useState(false);
  const [err, setErr] = useState(""); const [msg, setMsg] = useState("");
  const patch = (i: number, p: Partial<Block>) => setBlocks((bs) => bs.map((b, j) => (j === i ? ({ ...b, ...p } as Block) : b)));
  const move = (i: number, d: number) => setBlocks((bs) => { const a = [...bs]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const reset = () => { setSlug(""); setTitle(""); setBlocks([]); setInNav(true); setEditing(false); };

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setMsg("");
    const id = slugify(slug || title);
    if (!id) return setErr("Needs a title or slug.");
    const size = new Blob([JSON.stringify(blocks)]).size;
    if (size > 950_000) return setErr(`Page is ${(size / 1024).toFixed(0)} KB; Firestore caps a doc at ~1 MB. Use smaller images.`);
    try {
      await setDoc(doc(db, "pages", id), { title: title.trim() || id, blocks, inNav: id === "home" ? false : inNav, updatedAt: serverTimestamp() });
      setMsg(`Saved /p/?slug=${id}`); reset();
    } catch (x) { setErr((x as Error).message); }
  }
  const load = (p: Page) => { setEditing(true); setSlug(p.id); setTitle(p.title); setInNav(!!p.inNav); setBlocks(p.blocks ?? []); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-6 items-start">
      <form onSubmit={save} className="space-y-4 card p-5 sm:p-6 self-start">
        <h2 className="title text-xl">{editing ? "Edit page" : "New page"}</h2>
        <p className="text-sm text-muted">Build pages like a simple site editor. A page with the slug <code className="text-link">home</code> shows its blocks on the home page, under the featured game.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title"><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="About" /></Field>
          <Field label="Slug"><input className="field" value={slug} disabled={editing} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(title) || "about"} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={inNav} onChange={(e) => setInNav(e.target.checked)} /> Show in the top menu</label>

        <div className="space-y-3">
          {blocks.map((b, i) => (
            <div key={i} className="border border-line rounded-xl p-3 bg-card space-y-2">
              <div className="flex items-center gap-3">
                <span className="label">{b.type}</span>
                <span className="ml-auto flex gap-3 label">
                  <button type="button" onClick={() => move(i, -1)} className="hover:text-fg">up</button>
                  <button type="button" onClick={() => move(i, 1)} className="hover:text-fg">down</button>
                  <button type="button" onClick={() => setBlocks((bs) => bs.filter((_, j) => j !== i))} className="hover:text-hot">remove</button>
                </span>
              </div>
              {b.type === "heading" && <input className="field" value={b.text} onChange={(e) => patch(i, { text: e.target.value })} placeholder="Heading" />}
              {b.type === "text" && <textarea className="field" rows={5} value={b.text} onChange={(e) => patch(i, { text: e.target.value })} placeholder="Blank line = new paragraph. Links are detected." />}
              {b.type === "image" && (<><ImagePicker value={b.src} maxW={1200} onChange={(v) => patch(i, { src: v })} /><input className="field" value={b.caption ?? ""} onChange={(e) => patch(i, { caption: e.target.value })} placeholder="Caption (optional)" /></>)}
              {b.type === "link" && (<div className="grid sm:grid-cols-2 gap-2"><input className="field" value={b.label} onChange={(e) => patch(i, { label: e.target.value })} placeholder="Button text" /><input className="field" value={b.url} onChange={(e) => patch(i, { url: e.target.value })} placeholder="https://…" /></div>)}
              {b.type === "embed" && (<div className="grid sm:grid-cols-[1fr_7rem] gap-2"><input className="field" value={b.url} onChange={(e) => patch(i, { url: e.target.value })} placeholder="https://… (YouTube embed URL, form, etc.)" /><input className="field" type="number" value={b.height ?? 480} onChange={(e) => patch(i, { height: +e.target.value })} /></div>)}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ADD.map((a) => <button key={a.type} type="button" className="btn btn-ghost" onClick={() => setBlocks((bs) => [...bs, fresh(a.type)])}>+ {a.label}</button>)}
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary">Save page</button>
          {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
          <Status msg={msg} err={err} />
        </div>
      </form>
      <ul className="space-y-2">
        {data.map((p) => (
          <li key={p.id} className="border border-line rounded-xl p-3 bg-card">
            <div className="font-medium">{p.title}</div><div className="label">/{p.id}</div>
            <div className="flex gap-4 mt-1">
              <button className="label hover:text-link" onClick={() => load(p)}>edit</button>
              <button className="label hover:text-hot" onClick={() => confirm(`Delete "${p.title}"?`) && deleteDoc(doc(db, "pages", p.id))}>del</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
