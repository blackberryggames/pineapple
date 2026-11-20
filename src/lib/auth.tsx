"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, ADMIN_EMAIL } from "./firebase";

type Ctx = { user: User | null; loading: boolean; isAdmin: boolean };
const AuthCtx = createContext<Ctx>({ user: null, loading: true, isAdmin: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }), []);
  // Mirrors the Firestore rule: exact email AND verified.
  const isAdmin = !!user && user.emailVerified && user.email?.toLowerCase() === ADMIN_EMAIL;
  return <AuthCtx.Provider value={{ user, loading, isAdmin }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
