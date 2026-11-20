"use client";
import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAnnouncements } from "@/lib/data";
import { fmtDate } from "@/lib/util";
import { Field, Status } from "./common";

export default function NewsAdmin() {
  const { data } = useAnnouncements();
  const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [pinned, setPinned] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [err, setErr] = useState(""); const [msg, setMsg] = useState("");
  const reset = () => { setTitle(""); setBody(""); setPinned(false); setEditing(null); };

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setMsg("");
    try {
      if (editing) await updateDoc(doc(db, "announcements", editing), { title, body, pinned });
      else await addDoc(collection(db, "announcements"), { title, body, pinned, createdAt: serverTimestamp() });
      setMsg(editing ? "Saved." : "Posted."); reset();
    } catch (x) { setErr((x as Error).message); }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_22rem] gap-10">
      <form onSubmit={save} className="space-y-4">
        <h2 className="display text-2xl">{editing ? "Edit announcement" : "New announcement"}</h2>
        <Field label="Headline"><input className="field" required value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Message"><textarea className="field" rows={6} required value={body} onChange={(e) => setBody(e.target.value)} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} /> Pin to the top</label>
        <div className="flex items-center gap-3">
          <button className="btn btn-pine">{editing ? "Save" : "Post"}</button>
          {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
          <Status msg={msg} err={err} />
        </div>
      </form>
      <ul className="space-y-2">
        {data.map((a) => (
          <li key={a.id} className="border-2 border-line rounded-2xl p-3 bg-card">
            <div className="label">{fmtDate(a.createdAt)}{a.pinned ? " · pinned" : ""}</div>
            <div className="font-medium">{a.title}</div>
            <div className="flex gap-4 mt-1">
              <button className="label hover:text-link" onClick={() => { setEditing(a.id); setTitle(a.title); setBody(a.body); setPinned(!!a.pinned); }}>edit</button>
              <button className="label hover:text-hot" onClick={() => confirm("Delete this announcement?") && deleteDoc(doc(db, "announcements", a.id))}>del</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
