import type { Metadata } from "next";
import { Report } from "@/components/dashboard/Report";

export const metadata: Metadata = { title: "Report" };

export default function Page() {
  return <Report />;
}
