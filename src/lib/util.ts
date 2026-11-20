import type { Timestamp } from "firebase/firestore";

export const CATEGORIES = ["Arcade", "Puzzle", "Action", "Platformer", "Racing", "Sports", "Strategy", "Idle", "Other"];

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export function fmtDate(t?: Timestamp) {
  if (!t?.toDate) return "";
  return t.toDate().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function timeAgo(t?: Timestamp) {
  if (!t?.toDate) return "just now";
  const s = Math.max(1, Math.floor((Date.now() - t.toDate().getTime()) / 1000));
  const units: [number, string][] = [[31536000, "y"], [2592000, "mo"], [86400, "d"], [3600, "h"], [60, "m"]];
  for (const [n, u] of units) if (s >= n) return `${Math.floor(s / n)}${u} ago`;
  return "just now";
}

/** Resize + re-encode an image file so it fits comfortably in a Firestore doc (1 MiB limit). */
export function fileToCompressedDataUrl(file: File, maxW = 480, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Could not read file"));
    fr.onload = () => {
      // GIF/SVG: keep as-is if small, canvas would flatten them.
      if (/image\/(gif|svg)/.test(file.type)) {
        const s = fr.result as string;
        return s.length > 700_000 ? reject(new Error("GIF/SVG too large (max ~500 KB)")) : resolve(s);
      }
      const img = new Image();
      img.onerror = () => reject(new Error("Not a valid image"));
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.src = fr.result as string;
    };
    fr.readAsDataURL(file);
  });
}

export function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
