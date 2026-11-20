"use client";
import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useChangelogs } from "@/lib/data";
import type { ChangeKind, Changelog } from "@/lib/types";
import { fmtDate } from "@/lib/util";
import { Field, Status } from "./common";

type Entry = { kind: ChangeKind; text: string };
const KINDS: ChangeKind[] = ["added", "improved", "fixed", "removed"];

export default function ChangelogAdmin() {
  const { data } = useChangelogs();
  const [version, setVersion] = useState(""); const [title, setTitle] = useState(""); const [summary, setSummary] = useState("");
  const [entries, setEntries] = useState<Entry[]>([{ kind: "added", text: "" }]);
  const [editing, setEditing] = useState<string | null>(null);
  const [err, setErr] = useState(""); const [msg, setMsg] = useState("");
  const reset = () => { setVersion(""); setTitle(""); setSummary(""); setEntries([{ kind: "added", text: "" }]); setEditing(null); };
  const upd = (i: number, p: Partial<Entry>) => setEntries((es) => es.map((e, j) => (j === i ? { ...e, ...p } : e)));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setMsg("");
    const clean = entries.filter((x) => x.text.trim()).map((x) => ({ kind: x.kind, text: x.text.trim() }));
    if (!clean.length) return setErr("Add at least one change.");
    try {
      const payload = { version: version.trim(), title: title.trim(), summary: summary.trim(), entries: clean };
      if (editing) await updateDoc(doc(db, "changelogs", editing), payload);
      else await addDoc(collection(db, "changelogs"), { ...payload, createdAt: serverTimestamp() });
      setMsg("Published."); reset();
    } catch (x) { setErr((x as Error).message); }
  }
  const load = (c: Changelog) => { setEditing(c.id); setVersion(c.version); setTitle(c.title); setSummary(c.summary ?? ""); setEntries(c.entries); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="grid lg:grid-cols-[1fr_22rem] gap-10">
      <form onSubmit={save} className="space-y-4">
        <h2 className="display text-2xl">{editing ? "Edit release" : "New release"}</h2>
        <div className="grid sm:grid-cols-[8rem_1fr] gap-4">
          <Field label="Version"><input className="field" required placeholder="1.4" value={version} onChange={(e) => setVersion(e.target.value)} /></Field>
          <Field label="Title"><input className="field" required placeholder="Search and fullscreen" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        </div>
        <Field label="Summary (optional)"><textarea className="field" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} /></Field>
        <div>
          <span className="label block mb-1">Changes</span>
          <div className="space-y-2">
            {entries.map((en, i) => (
              <div key={i} className="flex gap-2">
                <select className="field !w-32 shrink-0" value={en.kind} onChange={(e) => upd(i, { kind: e.target.value as ChangeKind })}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
                <input className="field" value={en.text} onChange={(e) => upd(i, { text: e.target.value })} placeholder="What changed" />
                <button type="button" className="label hover:text-hot px-1" onClick={() => setEntries((es) => es.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost mt-2" onClick={() => setEntries((es) => [...es, { kind: es.at(-1)?.kind ?? "added", text: "" }])}>+ Add line</button>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-pine">{editing ? "Save" : "Publish"}</button>
          {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
          <Status msg={msg} err={err} />
        </div>
      </form>
      <ul className="space-y-2">
        {data.map((c) => (
          <li key={c.id} className="border-2 border-line rounded-2xl p-3 bg-card">
            <div className="label">{fmtDate(c.createdAt)}</div>
            <div className="font-medium"><span className="text-link">{c.version}</span> {c.title}</div>
            <div className="flex gap-4 mt-1">
              <button className="label hover:text-link" onClick={() => load(c)}>edit</button>
              <button className="label hover:text-hot" onClick={() => confirm("Delete this release?") && deleteDoc(doc(db, "changelogs", c.id))}>del</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
