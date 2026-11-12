import type { Metadata } from "next";
import { StandardView } from "@/components/standard/StandardView";

export const metadata: Metadata = { title: "The standard" };

export default function Page() {
  return <StandardView />;
}
