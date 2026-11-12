"use client";

import { Seal } from "@/components/Seal";
import { BRAND_NAME, DEMO_BANNER, DEMO_FOOTER, MONITOR_NAME } from "@/lib/brand";
import { millById, mills } from "@/lib/data";
import { formatNumber, formatPct, formatUsd } from "@/lib/format";
import { splitFees, totalsFor } from "@/lib/metrics";
import { useStore } from "@/lib/store";
import { useProgrammeBatches } from "@/lib/use-batches";

export function Report() {
  const { settings, view, millId } = useStore();
  const totals = totalsFor(useProgrammeBatches(), "month");
  const fees = splitFees(totals.verifiedM3, settings.feeRate, settings.clearThreadShare);
  const mill = millById(millId);
  const title = view === "mill" ? `${mill.name}, ${mill.line}` : view === "viridis" ? "Viridis operations" : BRAND_NAME;
  const lines = view === "mill" ? [mill] : mills;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex justify-end">
        <button type="button" className="inline-flex min-h-11 items-center rounded-xl bg-teal px-4 font-semibold text-white" onClick={() => window.print()}>
          Download as PDF
        </button>
      </div>
      <article className="report-sheet rounded-2xl border border-line bg-white p-8 shadow-card">
        <div className="flex items-center gap-3">
          <Seal size="md" status="verified" decorative />
          <div>
            <p className="font-display text-2xl font-extrabold text-ink">ClearThread</p>
            <p className="text-base text-body">Water report · November 2026</p>
          </div>
        </div>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink">{title}</h1>
        <p className="mt-3 text-base text-body">
          This note covers dye water treated for the programme, the share that passed independent verification, and the passports issued from those batches.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <ReportStat label="Water cleaned" value={`${formatNumber(totals.treatedM3)} m³`} />
          <ReportStat label="Verified" value={`${formatNumber(totals.verifiedM3)} m³`} />
          <ReportStat label="Verification rate" value={formatPct(totals.verificationRate)} />
          <ReportStat label="Average colour removal" value={formatPct(totals.avgColour)} />
          <ReportStat label="Water reused" value={formatPct(totals.waterReusedPct)} />
          <ReportStat label="Fees on verified water" value={formatUsd(fees.total)} />
        </dl>
        <h2 className="mt-8 font-display text-2xl font-extrabold text-ink">Downstream tests</h2>
        <table className="mt-3 w-full text-left text-base">
          <thead>
            <tr>
              <th scope="col" className="py-2 font-semibold text-ink">Mill</th>
              <th scope="col" className="py-2 font-semibold text-ink">Result</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((item) => (
              <tr key={item.id} className="border-t border-line">
                <td className="py-2">{item.name}, {item.city}</td>
                <td className="py-2">Clean · {MONITOR_NAME}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="mt-8 font-display text-2xl font-extrabold text-ink">Passports</h2>
        <p className="mt-2 text-base text-body">
          {formatNumber(totals.batchCount)} batch reports support the garment passports issued this month. Withheld and under-review volume is excluded from the fee.
        </p>
        <p className="mt-6 text-base text-body">{DEMO_BANNER}</p>
        <p className="mt-2 text-base text-body">{DEMO_FOOTER}</p>
      </article>
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-mist p-4">
      <dt className="text-base text-body">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-extrabold text-ink">{value}</dd>
    </div>
  );
}
