import type { Metadata } from "next";
import { Billing } from "@/components/dashboard/Billing";

export const metadata: Metadata = { title: "Billing" };

export default function Page() {
  return <Billing />;
}
