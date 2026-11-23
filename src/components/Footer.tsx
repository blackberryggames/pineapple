import Link from "next/link";
export default function Footer() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="px-4 sm:px-6 py-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted">
        <span>© Pineapple Games</span>
        <Link href="/games/" className="hover:text-fg">All games</Link>
        <Link href="/news/" className="hover:text-fg">News</Link>
        <Link href="/changelog/" className="hover:text-fg">Changelog</Link>
      </div>
    </footer>
  );
}
