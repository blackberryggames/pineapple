"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addDoc, collection, deleteDoc, doc, increment, limit, onSnapshot, orderBy, query, serverTimestamp, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import type { Comment } from "@/lib/types";
import { timeAgo } from "@/lib/util";
import Icon from "./Icon";

export function LikeButton({ gameId, count }: { gameId: string; count: number }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!user) { setLiked(false); return; }
    return onSnapshot(doc(db, "games", gameId, "likes", user.uid), (s) => setLiked(s.exists()));
  }, [gameId, user]);

  async function toggle() {
    if (!user) return setNote("Sign in to like games.");
    setBusy(true); setNote("");
    try {
      const b = writeBatch(db);
      const likeRef = doc(db, "games", gameId, "likes", user.uid);
      if (liked) { b.delete(likeRef); b.update(doc(db, "games", gameId), { likeCount: increment(-1) }); }
      else { b.set(likeRef, { createdAt: serverTimestamp() }); b.update(doc(db, "games", gameId), { likeCount: increment(1) }); }
      await b.commit();
    } catch { setNote("Couldn't save that like."); }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={toggle} disabled={busy} aria-pressed={liked} className={`btn ${liked ? "!border-hot !text-hot !bg-[#fdeeea]" : ""}`}>
        <Icon name="heart" size={16} fill={liked} />{Math.max(0, count)}
      </button>
      {note && <span className="text-sm text-muted">{note} {!user && <Link href="/login/" className="text-link underline">Sign in</Link>}</span>}
    </div>
  );
}

export function Comments({ gameId }: { gameId: string }) {
  const { user, isAdmin } = useAuth();
  const [list, setList] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const q = query(collection(db, "games", gameId, "comments"), orderBy("createdAt", "desc"), limit(100));
    return onSnapshot(q, (s) => setList(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment)));
  }, [gameId]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setBusy(true); setErr("");
    try {
      await addDoc(collection(db, "games", gameId, "comments"), {
        uid: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "player",
        text: text.trim().slice(0, 500),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch { setErr("Couldn't post that."); }
    setBusy(false);
  }

  return (
    <section>
      <h2 className="title text-xl mb-4">Comments <span className="text-muted font-medium">{list.length}</span></h2>
      {user ? (
        <form onSubmit={post} className="mb-6 space-y-2">
          <textarea className="field" rows={2} maxLength={500} placeholder="Say something about this game" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex items-center gap-3">
            <button className="btn btn-primary" disabled={busy || !text.trim()}>Post</button>
            <span className="label">{text.length}/500</span>
            {err && <span className="text-hot text-sm">{err}</span>}
          </div>
        </form>
      ) : (
        <p className="mb-6 text-muted"><Link href="/login/" className="text-link underline underline-offset-4">Sign in</Link> to comment.</p>
      )}
      <ul className="space-y-5">
        {list.map((c) => (
          <li key={c.id} className="flex gap-3"><span className="w-8 h-8 rounded-full bg-sunk text-fg grid place-items-center text-sm font-bold shrink-0">{c.name.charAt(0).toUpperCase()}</span><div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold">{c.name}</span>
              <span className="label">{timeAgo(c.createdAt)}</span>
              {(isAdmin || user?.uid === c.uid) && (
                <button className="label ml-auto hover:text-hot" onClick={() => deleteDoc(doc(db, "games", gameId, "comments", c.id))}>delete</button>
              )}
            </div>
            <p className="whitespace-pre-wrap break-words mt-0.5 ">{c.text}</p>
          </div></li>
        ))}
      </ul>
    </section>
  );
}
