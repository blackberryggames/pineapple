"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Game } from "@/lib/types";
import { fetchGameHtml } from "@/lib/data";
import Icon from "./Icon";
import { Art2 } from "./Cover";

type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> };

export default function Player({ game, actions }: { game: Game; actions?: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [fs, setFs] = useState(false);
  const [started, setStarted] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [key, setKey] = useState(0);

  const realFs = () => (document as FsDoc).fullscreenElement || (document as FsDoc).webkitFullscreenElement;

  // new game selected -> back to the play screen
  useEffect(() => { setStarted(false); setHtml(null); setFailed(false); }, [game.id]);

  useEffect(() => {
    const onChange = () => setFs(!!realFs());
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && box.current?.classList.contains("fake-fs")) { box.current.classList.remove("fake-fs"); setFs(false); } };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const start = useCallback(async () => {
    setStarted(true);
    if (game.kind === "html" && html === null) {
      try { setHtml(await fetchGameHtml(game.id)); } catch { setFailed(true); }
    }
    setTimeout(() => frame.current?.focus(), 80);
  }, [game.kind, game.id, html]);

  const toggleFs = useCallback(async () => {
    const el = box.current as FsEl | null;
    if (!el) return;
    if (realFs()) { await (document.exitFullscreen?.() ?? (document as FsDoc).webkitExitFullscreen?.()); return; }
    if (el.classList.contains("fake-fs")) { el.classList.remove("fake-fs"); setFs(false); return; }
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else throw new Error("no fs api");
    } catch {
      // iPhone Safari has no element fullscreen: fill the viewport instead.
      el.classList.add("fake-fs"); setFs(true);
    }
    frame.current?.focus();
  }, []);

  const sandbox = "allow-scripts allow-pointer-lock allow-forms allow-popups allow-modals allow-downloads" + (game.needsStorage || game.kind === "link" ? " allow-same-origin" : "");
  const ready = started && (game.kind === "link" || html !== null);

  return (
    <div>
      {/* aspect ratio is reserved up front so the page never jumps when the game loads */}
      <div ref={box} className="relative bg-black rounded-3xl overflow-hidden aspect-video w-full flex flex-col">
        {!started ? (
          <button onClick={() => { start(); }} className="absolute inset-0 group" aria-label={`Play ${game.title}`}>
            <div className="absolute inset-0 scale-110 blur-xl opacity-70"><Art2 game={game} /></div>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 sm:w-36 aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-[-3deg] group-hover:rotate-0 transition-transform"><Art2 game={game} /></div>
                <span className="btn btn-pine !h-12 !px-8 !text-base"><Icon name="play" size={18} fill />Play</span>
              </div>
            </div>
          </button>
        ) : failed ? (
          <div className="flex-1 grid place-items-center text-white/80 font-bold">Couldn&apos;t load this game. Try again in a moment.</div>
        ) : !ready ? (
          <div className="flex-1 grid place-items-center text-white/70 font-bold">Loading…</div>
        ) : (
          <iframe
            key={key} ref={frame} title={game.title} className="flex-1 w-full bg-white"
            {...(game.kind === "html" ? { srcDoc: html ?? "" } : { src: game.url })}
            sandbox={sandbox} allow="fullscreen; autoplay; gamepad; clipboard-write; accelerometer; gyroscope" allowFullScreen
            onLoad={() => frame.current?.focus()}
          />
        )}
        {fs && <button onClick={toggleFs} className="btn btn-sm btn-pine absolute top-3 right-3 z-10 opacity-80 hover:opacity-100">Exit fullscreen</button>}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button className="btn" onClick={async () => { if (!started) await start(); await toggleFs(); }}>
          <Icon name={fs ? "shrink" : "expand"} size={16} />{fs ? "Exit fullscreen" : "Fullscreen"}
        </button>
        <button className="btn" disabled={!ready} onClick={() => setKey((k) => k + 1)}><Icon name="restart" size={16} />Restart</button>
        {game.kind === "link" && game.url && <a className="btn" href={game.url} target="_blank" rel="noopener noreferrer"><Icon name="ext" size={16} />New tab</a>}
        {actions && <div className="ml-auto">{actions}</div>}
      </div>
      {game.kind === "link" && <p className="text-sm text-muted mt-2">If the game stays blank, that site doesn&apos;t allow embedding. Use New tab.</p>}
    </div>
  );
}
