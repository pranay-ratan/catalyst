import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BatchDetail } from "@/components/dashboard/BatchDetail";
import { batches, getBatch } from "@/lib/data";

export function generateStaticParams() {
  return batches.map((batch) => ({ id: batch.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const batch = getBatch(id);
  return { title: batch ? `Batch ${batch.id}` : "Batch" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getBatch(id)) notFound();
  return <BatchDetail id={id} />;
}
