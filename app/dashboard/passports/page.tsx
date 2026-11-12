import type { Metadata } from "next";
import { Passports } from "@/components/dashboard/Passports";

export const metadata: Metadata = { title: "Passports" };

export default function Page() {
  return <Passports />;
}
