"use client";
import { useState } from "react";
import { fileToCompressedDataUrl } from "@/lib/util";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label block mb-1">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted mt-1 block">{hint}</span>}
    </label>
  );
}

export function ImagePicker({ value, onChange, maxW = 640 }: { value?: string; onChange: (v: string) => void; maxW?: number }) {
  const [err, setErr] = useState("");
  return (
    <div className="flex items-start gap-3">
      {value && /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" className="w-28 h-20 object-cover border border-line rounded-2xl" />}
      <div className="space-y-1">
        <input type="file" accept="image/*" className="text-sm file:btn file:btn-sm file:mr-3" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          try { setErr(""); onChange(await fileToCompressedDataUrl(f, maxW)); } catch (x) { setErr((x as Error).message); }
        }} />
        {value && <button type="button" className="label hover:text-hot" onClick={() => onChange("")}>remove image</button>}
        {err && <p className="text-hot text-sm">{err}</p>}
        <p className="text-xs text-muted">Resized and stored as base64 in Firestore.</p>
      </div>
    </div>
  );
}

export function Status({ msg, err }: { msg?: string; err?: string }) {
  if (!msg && !err) return null;
  return <p className={`text-sm ${err ? "text-hot" : "text-leaf"}`}>{err || msg}</p>;
}
