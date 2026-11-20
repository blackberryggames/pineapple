"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDoc } from "@/lib/data";
import type { Page } from "@/lib/types";
import Blocks from "@/components/Blocks";
import { Empty, Loading } from "@/components/Bits";

function PageView() {
  const slug = useSearchParams().get("slug");
  const { data, loading } = useDoc<Page>("pages", slug);
  if (loading) return <Loading />;
  if (!data) return <Empty>That page doesn&apos;t exist.</Empty>;
  return (
    <article className="max-w-3xl">
      <h1 className="display text-4xl sm:text-6xl mb-8">{data.title}</h1>
      <Blocks blocks={data.blocks ?? []} />
    </article>
  );
}
export default function P() { return <Suspense fallback={<Loading />}><PageView /></Suspense>; }
