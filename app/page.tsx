import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";

export const metadata: Metadata = {
  title: { absolute: "ClearThread — Verified clean water, on every label" },
};

export default function Page() {
  return <HomeView />;
}
