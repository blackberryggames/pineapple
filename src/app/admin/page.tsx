"use client";
import { useState } from "react";
import Link from "next/link";
import { sendEmailVerification } from "firebase/auth";
import { useAuth } from "@/lib/auth";
import { ADMIN_EMAIL } from "@/lib/firebase";
import { Loading } from "@/components/Bits";
import GamesAdmin from "@/components/admin/GamesAdmin";
import NewsAdmin from "@/components/admin/NewsAdmin";
import ChangelogAdmin from "@/components/admin/ChangelogAdmin";
import PagesAdmin from "@/components/admin/PagesAdmin";

const TABS = ["Games", "Announcements", "Changelog", "Pages"] as const;

export default function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Games");
  const [sent, setSent] = useState(false);

  if (loading) return <Loading />;
  if (!user) return <p>This area is for the site admin. <Link href="/login/" className="text-link underline">Sign in</Link>.</p>;
  if (!isAdmin) {
    const right = user.email?.toLowerCase() === ADMIN_EMAIL;
    return (
      <div className="max-w-md space-y-3">
        <h1 className="title text-3xl">No access</h1>
        {right && !user.emailVerified ? (
          <>
            <p className="text-muted">Your email isn&apos;t verified yet. Verify it (or sign in with Google) to unlock admin.</p>
            <button className="btn btn-primary" disabled={sent} onClick={async () => { await sendEmailVerification(user); setSent(true); }}>{sent ? "Sent. Check your inbox, then reload." : "Send verification email"}</button>
          </>
        ) : <p className="text-muted">Only the site admin can use this page.</p>}
      </div>
    );
  }

  return (
    <div>
      <h1 className="title text-3xl sm:text-4xl mb-6">Admin</h1>
      <div className="flex gap-1 mb-8 border-b border-line overflow-x-auto hide-scroll">{TABS.map((t) => <button key={t} onClick={() => setTab(t)} aria-current={tab === t} className={`px-4 h-10 text-sm font-semibold -mb-px border-b-2 whitespace-nowrap ${tab === t ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg"}`}>{t}</button>)}</div>
      {tab === "Games" && <GamesAdmin />}
      {tab === "Announcements" && <NewsAdmin />}
      {tab === "Changelog" && <ChangelogAdmin />}
      {tab === "Pages" && <PagesAdmin />}
    </div>
  );
}
