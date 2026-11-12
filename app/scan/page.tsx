import type { Metadata } from "next";
import { ScanView } from "@/components/scan/ScanView";

export const metadata: Metadata = { title: "Scan a garment" };

export default function Page() {
  return <ScanView />;
}
