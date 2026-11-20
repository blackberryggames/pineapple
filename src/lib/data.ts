"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, type Query } from "firebase/firestore";
import { db } from "./firebase";
import type { Game, Announcement, Changelog, Page } from "./types";

function useCol<T>(make: () => Query, deps: unknown[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    return onSnapshot(
      make(),
      (snap) => { setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)); setLoading(false); },
      (e) => { setError(e.message); setLoading(false); }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error };
}

export const useGames = () => useCol<Game>(() => query(collection(db, "games"), orderBy("createdAt", "desc")));
export const useAnnouncements = () => useCol<Announcement>(() => query(collection(db, "announcements"), orderBy("createdAt", "desc")));
export const useChangelogs = () => useCol<Changelog>(() => query(collection(db, "changelogs"), orderBy("createdAt", "desc")));
export const usePages = () => useCol<Page>(() => query(collection(db, "pages")));

export function useDoc<T>(path: string, id: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) { setData(null); setLoading(false); return; }
    setLoading(true);
    return onSnapshot(doc(db, path, id), (s) => {
      setData(s.exists() ? ({ id: s.id, ...s.data() } as T) : null);
      setLoading(false);
    }, () => setLoading(false));
  }, [path, id]);
  return { data, loading };
}
