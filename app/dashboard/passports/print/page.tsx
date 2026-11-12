import type { Metadata } from "next";
import { PrintSheet } from "@/components/dashboard/PrintSheet";

export const metadata: Metadata = { title: "Print tags" };

export default async function Page({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const params = await searchParams;
  const ids = typeof params.ids === "string" ? params.ids : undefined;
  return <PrintSheet ids={ids} />;
}
