"use client";
import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useGames } from "@/lib/data";
import type { Game } from "@/lib/types";
import { CATEGORIES } from "@/lib/util";
import { Field, ImagePicker, Status } from "./common";
import Thumb from "../Thumb";

const blank = { title: "", description: "", controls: "", category: "Arcade", tags: "", kind: "html" as "html" | "link", html: "", url: "", thumbnail: "", featured: false, needsStorage: false };
const MAX_DOC = 950_000; // Firestore hard limit is 1 MiB per document

export default function GamesAdmin() {
  const { data: games } = useGames();
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof blank>(k: K, v: (typeof blank)[K]) => setF((p) => ({ ...p, [k]: v }));

  function edit(g: Game) {
    setEditing(g.id);
    setF({ title: g.title, description: g.description ?? "", controls: g.controls ?? "", category: g.category, tags: (g.tags ?? []).join(", "), kind: g.kind, html: g.html ?? "", url: g.url ?? "", thumbnail: g.thumbnail ?? "", featured: !!g.featured, needsStorage: !!g.needsStorage });
    setMsg(""); setErr(""); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const reset = () => { setEditing(null); setF(blank); };

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setMsg("");
    if (f.kind === "link" && !/^https?:\/\//.test(f.url)) return setErr("Link must start with http:// or https://");
    if (f.kind === "html" && !f.html.trim()) return setErr("Paste or upload the game's HTML.");
    const payload: Record<string, unknown> = {
      title: f.title.trim(), description: f.description.trim(), controls: f.controls.trim(), category: f.category,
      tags: f.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean), kind: f.kind,
      html: f.kind === "html" ? f.html : "", url: f.kind === "link" ? f.url.trim() : "",
      thumbnail: f.thumbnail, featured: f.featured, needsStorage: f.needsStorage,
    };
    const size = new Blob([JSON.stringify(payload)]).size;
    if (size > MAX_DOC) return setErr(`Too big for Firestore: ${(size / 1024).toFixed(0)} KB of ~930 KB. Host the game elsewhere and add it as a link, or strip big inline assets.`);
    setBusy(true);
    try {
      if (editing) await updateDoc(doc(db, "games", editing), payload);
      else await addDoc(collection(db, "games"), { ...payload, likeCount: 0, playCount: 0, createdAt: serverTimestamp() });
      setMsg(editing ? "Saved." : "Game added."); reset();
    } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  }

  async function remove(g: Game) {
    if (!confirm(`Delete “${g.title}” and its comments?`)) return;
    try {
      for (const sub of ["comments", "likes"]) {
        const snap = await getDocs(collection(db, "games", g.id, sub));
        const b = writeBatch(db); snap.docs.forEach((d) => b.delete(d.ref)); await b.commit();
      }
      await deleteDoc(doc(db, "games", g.id));
      if (editing === g.id) reset();
    } catch (x) { setErr((x as Error).message); }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_22rem] gap-10">
      <form onSubmit={save} className="space-y-4">
        <h2 className="display text-2xl">{editing ? "Edit game" : "Add a game"}</h2>
        <Field label="Title"><input className="field" required value={f.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Category">
            <select className="field" value={f.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Tags" hint="Comma separated. Used by search."><input className="field" value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="2 player, retro" /></Field>
        </div>
        <Field label="Description"><textarea className="field" rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Controls (optional)"><textarea className="field" rows={2} value={f.controls} onChange={(e) => set("controls", e.target.value)} placeholder="WASD to move, Space to jump" /></Field>

        <div>
          <span className="label block mb-1">How is it added?</span>
          <div className="flex gap-2">
            <button type="button" className="chip" aria-pressed={f.kind === "html"} onClick={() => set("kind", "html")}>Paste HTML</button>
            <button type="button" className="chip" aria-pressed={f.kind === "link"} onClick={() => set("kind", "link")}>Link / embed URL</button>
          </div>
        </div>

        {f.kind === "html" ? (
          <>
            <Field label="Game HTML" hint="A complete single-file game (inline CSS and JS). Or upload an .html file.">
              <textarea className="field font-mono text-xs" rows={10} value={f.html} onChange={(e) => set("html", e.target.value)} placeholder="<!doctype html>…" />
            </Field>
            <input type="file" accept=".html,.htm,text/html" className="text-sm file:btn file:mr-3 file:text-sm" onChange={async (e) => { const file = e.target.files?.[0]; if (file) set("html", await file.text()); }} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.needsStorage} onChange={(e) => set("needsStorage", e.target.checked)} /> Game needs saves (localStorage). Only tick for HTML you trust.</label>
          </>
        ) : (
          <Field label="URL" hint="Must allow being embedded in an iframe. If a site refuses, players get an “open in new tab” button.">
            <input className="field" type="url" value={f.url} onChange={(e) => set("url", e.target.value)} placeholder="https://…" />
          </Field>
        )}

        <Field label="Thumbnail"><ImagePicker value={f.thumbnail} onChange={(v) => set("thumbnail", v)} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Feature on the home page</label>

        <div className="flex items-center gap-3">
          <button className="btn btn-pine" disabled={busy}>{editing ? "Save changes" : "Add game"}</button>
          {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
          <Status msg={msg} err={err} />
        </div>
      </form>

      <div>
        <h2 className="display text-2xl mb-4">All games <span className="text-muted">{games.length}</span></h2>
        <ul className="space-y-2">
          {games.map((g) => (
            <li key={g.id} className="flex items-center gap-3 border-2 border-line rounded-[3px] p-2 bg-panel">
              <div className="w-14 h-10 shrink-0 overflow-hidden rounded-[2px]"><Thumb game={g} className="!text-3xl" /></div>
              <div className="min-w-0 flex-1"><div className="truncate font-medium">{g.title}</div><div className="label">{g.kind} · ♥ {g.likeCount ?? 0}</div></div>
              <button className="label hover:text-pine" onClick={() => edit(g)}>edit</button>
              <button className="label hover:text-hot" onClick={() => remove(g)}>del</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
