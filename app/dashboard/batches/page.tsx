import type { Metadata } from "next";
import { BatchesTable } from "@/components/dashboard/BatchesTable";

export const metadata: Metadata = { title: "Batches" };

export default function Page() {
  return <BatchesTable />;
}
