import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PassportView } from "@/components/passport/PassportView";
import { BRAND_NAME } from "@/lib/brand";
import { garments, getBatch, getGarment, millById } from "@/lib/data";
import type { LinkedBatch } from "@/lib/dpp";

export function generateStaticParams() {
  return garments.map((garment) => ({ garmentId: garment.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ garmentId: string }> }): Promise<Metadata> {
  const { garmentId } = await params;
  const garment = getGarment(garmentId);
  if (!garment) return { title: "Passport not found" };
  return {
    title: garment.name,
    description: `ClearThread garment passport for the ${garment.name} by ${BRAND_NAME}.`,
  };
}

export default async function Page({ params }: { params: Promise<{ garmentId: string }> }) {
  const { garmentId } = await params;
  const garment = getGarment(garmentId);
  if (!garment) notFound();
  const sources: LinkedBatch[] = [];
  for (const batchId of garment.batchIds) {
    const batch = getBatch(batchId);
    if (!batch) continue;
    const mill = millById(batch.millId);
    sources.push({
      batch,
      millName: mill.name,
      millLine: mill.line,
      millCity: mill.city,
      country: mill.country,
      unitId: mill.unitId,
    });
  }
  if (sources.length === 0) notFound();
  return <PassportView garment={garment} sources={sources} />;
}
