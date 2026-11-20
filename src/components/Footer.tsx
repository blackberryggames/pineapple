import Link from "next/link";
export default function Footer() {
  return (
    <footer className="border-t-2 border-line mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        <span>Pineapple Games</span>
        <Link href="/games/" className="hover:text-cream">All games</Link>
        <Link href="/changelog/" className="hover:text-cream">Changelog</Link>
        <Link href="/news/" className="hover:text-cream">News</Link>
      </div>
    </footer>
  );
}
