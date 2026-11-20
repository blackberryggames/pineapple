"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, sendEmailVerification, sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

function nice(e: unknown) {
  const code = (e as { code?: string }).code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/email-already-in-use": "That email already has an account. Try signing in.",
    "auth/weak-password": "Password needs at least 6 characters.",
    "auth/invalid-email": "That doesn't look like a valid email.",
    "auth/popup-closed-by-user": "Sign-in window was closed.",
    "auth/unauthorized-domain": "This site's domain isn't allowed in Firebase Auth yet (Authentication → Settings → Authorized domains).",
  };
  return map[code] ?? (e as Error).message ?? "Something went wrong.";
}

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setErr(""); setInfo(""); setBusy(true);
    try { await fn(); router.push("/"); } catch (e) { setErr(nice(e)); } finally { setBusy(false); }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      if (mode === "in") return signInWithEmailAndPassword(auth, email, pw);
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      await sendEmailVerification(cred.user).catch(() => {});
    });
  };

  return (
    <div className="max-w-sm mx-auto pt-6">
      <h1 className="display text-4xl mb-1">{mode === "in" ? "Sign in" : "Make an account"}</h1>
      <p className="text-muted text-sm mb-6">You only need an account to like games and comment.</p>

      <button className="btn w-full" disabled={busy} onClick={() => run(() => signInWithPopup(auth, new GoogleAuthProvider()))}>
        Continue with Google
      </button>
      <div className="label text-center my-5">or with email</div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "up" && <input className="field" placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} />}
        <input className="field" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <input className="field" type="password" required placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
        {err && <p className="text-hot text-sm">{err}</p>}
        {info && <p className="text-leaf text-sm">{info}</p>}
        <button className="btn btn-pine w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</button>
      </form>

      <div className="flex justify-between text-sm mt-5 text-muted">
        <button className="underline underline-offset-4 hover:text-cream" onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(""); }}>
          {mode === "in" ? "Need an account?" : "Have an account?"}
        </button>
        {mode === "in" && (
          <button className="underline underline-offset-4 hover:text-cream" onClick={async () => {
            if (!email) return setErr("Type your email above first.");
            try { await sendPasswordResetEmail(auth, email); setErr(""); setInfo("Reset link sent."); } catch (e) { setErr(nice(e)); }
          }}>Forgot password?</button>
        )}
      </div>
    </div>
  );
}
