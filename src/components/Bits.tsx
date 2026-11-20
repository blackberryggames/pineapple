export function SectionHead({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between border-b-2 border-line pb-2 mb-5">
      <h2 className="display text-2xl sm:text-3xl">{title}</h2>
      {right}
    </div>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="border-2 border-dashed border-line rounded-[3px] p-8 text-center text-muted">{children}</div>;
}
export function Loading() {
  return <div className="label py-8">Loading…</div>;
}
