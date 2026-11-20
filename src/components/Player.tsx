"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Game } from "@/lib/types";

type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> };

export default function Player({ game }: { game: Game }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [fs, setFs] = useState(false);
  const [started, setStarted] = useState(false);
  const [key, setKey] = useState(0);

  const realFs = () => (document as FsDoc).fullscreenElement || (document as FsDoc).webkitFullscreenElement;

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

  return (
    <div>
      <div ref={box} className="relative bg-black border-2 border-line rounded-[3px] aspect-video w-full flex flex-col">
        {!started ? (
          <button onClick={() => { setStarted(true); setTimeout(() => frame.current?.focus(), 50); }} className="absolute inset-0 grid place-items-center group" aria-label={`Play ${game.title}`}>
            <span className="btn btn-pine !text-lg !px-8 !py-3 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px]">▶ Play {game.title}</span>
          </button>
        ) : (
          <iframe
            key={key}
            ref={frame}
            title={game.title}
            className="flex-1 w-full bg-white"
            {...(game.kind === "html" ? { srcDoc: game.html } : { src: game.url })}
            sandbox={sandbox}
            allow="fullscreen; autoplay; gamepad; clipboard-write; accelerometer; gyroscope"
            allowFullScreen
            onLoad={() => frame.current?.focus()}
          />
        )}
        {fs && (
          <button onClick={toggleFs} className="btn btn-pine absolute top-3 right-3 z-10 opacity-60 hover:opacity-100">Exit fullscreen</button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button className="btn btn-pine" onClick={async () => { if (!started) setStarted(true); await toggleFs(); }}>
          {fs ? "Exit fullscreen" : "Fullscreen"}
        </button>
        <button className="btn btn-ghost" disabled={!started} onClick={() => setKey((k) => k + 1)}>Restart</button>
        {game.kind === "link" && game.url && (
          <a className="btn btn-ghost" href={game.url} target="_blank" rel="noopener noreferrer">Open in new tab</a>
        )}
        {game.kind === "link" && <span className="label">Blank? The site may block embedding. Use “Open in new tab”.</span>}
      </div>
    </div>
  );
}
