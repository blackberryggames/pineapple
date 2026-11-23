"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { collection, doc, getDoc, onSnapshot, orderBy, query, type Query } from "firebase/firestore";
import { db } from "./firebase";
import type { Game, Announcement, Changelog, Page } from "./types";
import { MOCK, MOCK_GAMES, MOCK_HTML, MOCK_LOGS, MOCK_NEWS, MOCK_PAGES } from "./mock";

type Col<T> = { data: T[]; loading: boolean; error: string | null };

function useCol<T>(make: () => Query, mock: T[]): Col<T> {
  const [s, setS] = useState<Col<T>>({ data: MOCK ? mock : [], loading: !MOCK, error: null });
  useEffect(() => {
    if (MOCK) return;
    return onSnapshot(
      make(),
      (snap) => setS({ data: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T), loading: false, error: null }),
      (e) => setS({ data: [], loading: false, error: e.message })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return s;
}

type Shared = { games: Col<Game>; news: Col<Announcement>; pages: Col<Page> };
const Ctx = createContext<Shared | null>(null);

/** One set of live listeners for the whole app (games list is the heavy one). */
export function DataProvider({ children }: { children: ReactNode }) {
  const games = useCol<Game>(() => query(collection(db, "games"), orderBy("createdAt", "desc")), MOCK_GAMES);
  const news = useCol<Announcement>(() => query(collection(db, "announcements"), orderBy("createdAt", "desc")), MOCK_NEWS);
  const pages = useCol<Page>(() => query(collection(db, "pages")), MOCK_PAGES);
  return <Ctx.Provider value={{ games, news, pages }}>{children}</Ctx.Provider>;
}
const useShared = () => { const c = useContext(Ctx); if (!c) throw new Error("DataProvider missing"); return c; };

export const useGames = () => useShared().games;
export const useAnnouncements = () => useShared().news;
export const usePages = () => useShared().pages;
export const useChangelogs = () => useCol<Changelog>(() => query(collection(db, "changelogs"), orderBy("createdAt", "desc")), MOCK_LOGS);

export function useDoc<T extends { id: string }>(path: string, id: string | null) {
  const { games, pages } = useShared();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  // Live listener. Depends ONLY on path/id: re-subscribing whenever the games list changed
  // (e.g. the play-count bump) used to flash the page to a skeleton and rebuild the player.
  useEffect(() => {
    if (MOCK) return;
    if (!id) { setData(null); setLoading(false); return; }
    setLoading(true);
    return onSnapshot(doc(db, path, id), (s) => {
      setData(s.exists() ? ({ id: s.id, ...s.data() } as T) : null);
      setLoading(false);
    }, () => setLoading(false));
  }, [path, id]);

  useEffect(() => {
    if (!MOCK) return;
    const list = (path === "games" ? games.data : pages.data) as unknown as T[];
    setData(id ? list.find((x) => x.id === id) ?? null : null); setLoading(false);
  }, [path, id, games.data, pages.data]);

  return { data, loading };
}

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(Object.assign(new Error("Timed out talking to Firestore"), { code: "timeout" })), ms))]);

/** Game source lives in its own doc so the games list stays small. Older games kept it inline on the game doc. */
export async function fetchGameHtml(id: string): Promise<string> {
  if (MOCK) return MOCK_HTML;
  const file = await withTimeout(getDoc(doc(db, "gameFiles", id)), 15000);
  const html = file.data()?.html;
  if (typeof html === "string" && html.trim()) return html;
  const legacy = (await withTimeout(getDoc(doc(db, "games", id)), 15000)).data()?.html;
  if (typeof legacy === "string" && legacy.trim()) return legacy;
  throw Object.assign(new Error("This game has no HTML saved"), { code: "empty" });
}
