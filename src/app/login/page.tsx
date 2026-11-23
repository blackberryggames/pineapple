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
    <div className="max-w-sm mx-auto pt-8">
      <div className="card p-6 sm:p-7">
        <h1 className="title text-2xl">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
        <p className="text-muted text-sm mt-1 mb-6">An account lets you like games and comment.</p>

        <button className="btn w-full !h-11" disabled={busy} onClick={() => run(() => signInWithPopup(auth, new GoogleAuthProvider()))}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
          Continue with Google
        </button>
        <div className="flex items-center gap-3 my-5"><span className="h-px flex-1 bg-line" /><span className="text-xs font-medium text-muted">or</span><span className="h-px flex-1 bg-line" /></div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "up" && <input className="field" placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} />}
          <input className="field" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input className="field" type="password" required placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
          {err && <p className="text-hot text-sm font-medium">{err}</p>}
          {info && <p className="text-leaf text-sm font-medium">{info}</p>}
          <button className="btn btn-primary w-full !h-11" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</button>
        </form>
      </div>

      <div className="flex justify-between text-sm mt-5 text-muted px-1">
        <button className="font-medium hover:text-fg" onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(""); }}>
          {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
        {mode === "in" && (
          <button className="font-medium hover:text-fg" onClick={async () => {
            if (!email) return setErr("Type your email above first.");
            try { await sendPasswordResetEmail(auth, email); setErr(""); setInfo("Reset link sent."); } catch (e) { setErr(nice(e)); }
          }}>Forgot password?</button>
        )}
      </div>
    </div>
  );
}
