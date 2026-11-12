import { AlertTriangle, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/types";

const COPY = {
  verified: { label: "Verified", className: "bg-teal text-white", Icon: Check },
  review: { label: "Under review", className: "bg-amber text-ink", Icon: Clock },
  withheld: { label: "Withheld", className: "bg-dye text-white", Icon: AlertTriangle },
} as const;

export function StatusPill({ status, label }: { status: Status; label?: string }) {
  const item = COPY[status];
  const Icon = item.Icon;
  return (
    <span className={cn("inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold", item.className)}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label ?? item.label}
    </span>
  );
}
