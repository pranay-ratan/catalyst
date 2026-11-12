import type { Metadata } from "next";
import { Presenter } from "@/components/demo/Presenter";

export const metadata: Metadata = { title: "Presenter" };

export default function Page() {
  return <Presenter />;
}
