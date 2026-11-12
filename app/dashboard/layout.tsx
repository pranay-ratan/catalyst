import { DashboardShell } from "@/components/dashboard/Shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
