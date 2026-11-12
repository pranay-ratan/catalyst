"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Beaker, FileBarChart, LayoutDashboard, Menu, QrCode, Receipt, Settings } from "lucide-react";
import { Seal } from "@/components/Seal";
import { Sheet } from "@/components/ui/sheet";
import { BRAND_NAME } from "@/lib/brand";
import { mills } from "@/lib/data";
import { RANGE_OPTIONS } from "@/lib/range";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { RangeKey, ViewAs } from "@/lib/types";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/batches", label: "Batches", icon: Beaker, exact: false },
  { href: "/dashboard/passports", label: "Passports", icon: QrCode, exact: false },
  { href: "/dashboard/billing", label: "Billing", icon: Receipt, exact: false },
  { href: "/dashboard/reports", label: "Report", icon: FileBarChart, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
];

const VIEWS: { id: ViewAs; label: string }[] = [
  { id: "brand", label: `Brand · ${BRAND_NAME}` },
  { id: "mill", label: "Mill" },
  { id: "viridis", label: "Viridis operations" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { range, setRange, view, setView, millId, setMillId, query, setQuery } = useStore();
  const hideChrome = pathname.startsWith("/dashboard/passports/print");

  return (
    <div className="flex min-h-[70vh]">
      <aside className={cn("no-print sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-white md:flex", hideChrome && "md:hidden")}>
        <Sidebar pathname={pathname} view={view} setView={setView} millId={millId} setMillId={setMillId} onNavigate={() => undefined} />
      </aside>
      <div className="min-w-0 flex-1">
        <header className={cn("no-print sticky top-16 z-30 flex flex-wrap items-center gap-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur", hideChrome && "hidden")}>
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white md:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu aria-hidden="true" />
          </button>
          <label className="min-w-0 flex-1 text-base font-semibold text-ink md:max-w-xs">
            <span className="sr-only">Search batches</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search batch, mill, or unit"
              className="h-11 w-full rounded-xl border border-line bg-white px-3 text-base font-normal text-ink"
            />
          </label>
          <div className="flex items-center gap-2">
            <label className="text-base font-semibold text-ink lg:hidden">
              <span className="sr-only">Date range</span>
              <select
                value={range}
                onChange={(event) => setRange(event.target.value as RangeKey)}
                className="h-11 rounded-xl border border-line bg-white px-3 text-base font-normal"
              >
                {RANGE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="hidden rounded-xl border border-line bg-white p-1 lg:flex" role="group" aria-label="Date range">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={range === option.id}
                  className={cn("min-h-11 rounded-lg px-3 font-semibold", range === option.id ? "bg-ink text-white" : "text-ink")}
                  onClick={() => setRange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </header>
        <div className="px-4 py-6 md:px-8">{children}</div>
      </div>
      <Sheet open={open} onOpenChange={setOpen} title="ClearThread">
        <Sidebar
          pathname={pathname}
          view={view}
          setView={setView}
          millId={millId}
          setMillId={setMillId}
          onNavigate={() => setOpen(false)}
        />
      </Sheet>
    </div>
  );
}

function Sidebar({
  pathname,
  view,
  setView,
  millId,
  setMillId,
  onNavigate,
}: {
  pathname: string;
  view: ViewAs;
  setView: (view: ViewAs) => void;
  millId: string;
  setMillId: (id: string) => void;
  onNavigate: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="flex min-h-11 items-center gap-2 px-4 py-4 font-display text-xl font-extrabold text-ink" onClick={onNavigate}>
        <Seal size="sm" decorative />
        ClearThread
      </Link>
      <nav className="flex flex-col gap-1 px-3" aria-label="Dashboard">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold",
                active ? "bg-mist text-ink" : "text-body hover:bg-paper",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
              {active ? <span className="sr-only">current</span> : null}
            </Link>
          );
        })}
      </nav>
      <fieldset className="mt-auto border-t border-line p-4">
        <legend className="mb-2 font-semibold text-ink">View as</legend>
        <div className="grid gap-2">
          {VIEWS.map((option) => (
            <label key={option.id} className="flex min-h-11 items-center gap-2 text-base text-ink">
              <input type="radio" name="view-as" checked={view === option.id} onChange={() => setView(option.id)} />
              {option.label}
            </label>
          ))}
        </div>
        {view === "mill" ? (
          <label className="mt-3 block font-semibold text-ink">
            Mill line
            <select
              value={millId}
              onChange={(event) => setMillId(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-line bg-white px-3 font-normal"
            >
              {mills.map((mill) => (
                <option key={mill.id} value={mill.id}>
                  {mill.name}, {mill.line}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </fieldset>
    </div>
  );
}
