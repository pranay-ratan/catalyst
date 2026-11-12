"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/brand";
import { downloadCsv } from "@/lib/csv";
import { formatNumber, formatUsd } from "@/lib/format";
import { monthSummaries, splitFees, type MonthSummary } from "@/lib/metrics";
import { useStore } from "@/lib/store";
import { useProgrammeBatches } from "@/lib/use-batches";

export function Billing() {
  const { settings, view } = useStore();
  const months = monthSummaries(useProgrammeBatches());
  const [monthId, setMonthId] = useState("2026-11");
  const month = months.find((item) => item.id === monthId) ?? months[2];
  if (!month) return null;
  const fees = splitFees(month.verifiedM3, settings.feeRate, settings.clearThreadShare);
  const payer = view === "viridis" ? "Viridis share this month" : view === "mill" ? "Brand fees on this line" : `${BRAND_NAME} pays`;

  function exportCsv() {
    const header = ["Month", "Verified m3", "Under review m3", "Withheld m3", "Fee rate USD", "Total USD", "ClearThread USD", "Viridis USD", "Status"];
    const body = months.map((item) => {
      const split = splitFees(item.verifiedM3, settings.feeRate, settings.clearThreadShare);
      return [item.label, item.verifiedM3, item.reviewM3, item.withheldM3, settings.feeRate.toFixed(2), split.total.toFixed(2), split.clearThread.toFixed(2), split.viridis.toFixed(2), item.invoiceStatus];
    });
    downloadCsv("clearthread-invoices.csv", [header, ...body]);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Billing</h1>
          <p className="mt-2 text-base text-body">Only verified cubic metres are billed. Amounts use the fee rate in Settings.</p>
        </div>
        <Button variant="secondary" onClick={exportCsv}>
          Download CSV
        </Button>
      </div>
      <label className="mt-6 block font-semibold text-ink">
        Statement month
        <select value={month.id} onChange={(event) => setMonthId(event.target.value)} className="mt-2 block h-11 rounded-xl border border-line bg-white px-3 font-normal">
          {months.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
        <p className="text-base text-body">{payer}</p>
        <p className="mt-2 font-display text-5xl font-extrabold tracking-tight text-ink" aria-live="polite">
          {formatUsd(fees.total)}
        </p>
        <p className="mt-3 text-base text-ink">
          {formatNumber(month.verifiedM3)} m³ verified × {formatUsd(settings.feeRate)}
        </p>
        <div className="mt-6 overflow-hidden rounded-full bg-mist" aria-hidden="true">
          <div className="flex h-4">
            <div className="bg-teal" style={{ width: `${settings.clearThreadShare}%` }} />
            <div className="bg-water" style={{ width: `${100 - settings.clearThreadShare}%` }} />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl bg-mist p-4">
            <p className="font-semibold text-ink">ClearThread · {settings.clearThreadShare}%</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">{formatUsd(fees.clearThread)}</p>
            <p className="text-base text-body">Standards, audit, and passports</p>
          </article>
          <article className="rounded-2xl bg-mist p-4">
            <p className="font-semibold text-ink">Viridis · {100 - settings.clearThreadShare}%</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">{formatUsd(fees.viridis)}</p>
            <p className="text-base text-body">Running the units</p>
          </article>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-display text-2xl font-extrabold text-ink">Not billed</h2>
        <p className="mt-2 text-base text-body">Under review {formatNumber(month.reviewM3)} m³. Withheld {formatNumber(month.withheldM3)} m³. These volumes are not billed.</p>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-base">
          <caption className="sr-only">Invoice history</caption>
          <thead className="bg-mist text-ink">
            <tr>
              {["Month", "Verified", "Not billed", "Total", "Status"].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {months.map((item) => (
              <InvoiceRow key={item.id} item={item} feeRate={settings.feeRate} share={settings.clearThreadShare} />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function InvoiceRow({ item, feeRate, share }: { item: MonthSummary; feeRate: number; share: number }) {
  const fees = splitFees(item.verifiedM3, feeRate, share);
  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3 font-semibold text-ink">{item.label}</td>
      <td className="px-4 py-3">{formatNumber(item.verifiedM3)} m³</td>
      <td className="px-4 py-3">{formatNumber(item.reviewM3 + item.withheldM3)} m³</td>
      <td className="px-4 py-3">{formatUsd(fees.total)}</td>
      <td className="px-4 py-3">{item.invoiceStatus}</td>
    </tr>
  );
}
