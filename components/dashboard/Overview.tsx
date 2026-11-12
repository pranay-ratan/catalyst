"use client";

import Link from "next/link";
import { AlertTriangle, Check, Clock } from "lucide-react";
import { CodChart, DailyVolumeChart, ScanChart } from "@/components/charts/Charts";
import { CountUp, Cubic, Money } from "@/components/CountUp";
import { EmptyState } from "@/components/EmptyState";
import { Sparkline } from "@/components/Sparkline";
import { StatusPill } from "@/components/StatusPill";
import { BRAND_NAME } from "@/lib/brand";
import { millById, mills, scanSeries } from "@/lib/data";
import { formatDateTime, formatNumber, formatPct } from "@/lib/format";
import { alertsFor, latestBatch, splitFees, totalsFor } from "@/lib/metrics";
import { inRange, rangePhrase } from "@/lib/range";
import { useStore } from "@/lib/store";
import { useWorkingBatches } from "@/lib/use-batches";

export function Overview() {
  const { settings, range, view, millId } = useStore();
  const rows = useWorkingBatches().filter((batch) => inRange(batch.start, range));
  const totals = totalsFor(rows, range);
  const money = splitFees(totals.verifiedM3, settings.feeRate, settings.clearThreadShare);
  const fee = view === "viridis" ? money.viridis : money.total;
  const feeLabel = view === "viridis" ? "Viridis share" : view === "mill" ? "Fees on this line" : "Fees accrued";
  const mill = millById(millId);
  const title = view === "brand" ? BRAND_NAME : view === "mill" ? `${mill.name}, ${mill.line}` : "Viridis operations";
  const scans = scanSeries.filter((point) => inRange(`${point.date}T12:00:00.000Z`, range));
  const alerts = alertsFor(rows);
  const sparkTreated = totals.daily.map((point) => point.treated);
  const sparkVerified = totals.daily.map((point) => point.verified);

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-base text-body">{rangePhrase(range)}</p>
      <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 max-w-2xl text-base text-body">
        {view === "viridis"
          ? "Uptime and the share earned for running the units."
          : "Treated water, verified water, and the fee on what passed."}
      </p>
      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No batches in this view" body="Try another date range, mill, or search." />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Treated" value={<Cubic value={totals.treatedM3} />} spark={sparkTreated} color="#4A9BE8" />
            <Kpi label="Verified" value={<Cubic value={totals.verifiedM3} />} spark={sparkVerified} color="#0E7B6D" />
            <Kpi label="Verification rate" value={<span><CountUp value={totals.verificationRate} digits={1} />%</span>} note="Verified volume ÷ treated volume" />
            <Kpi label="Batch reports" value={<CountUp value={totals.batchCount} />} />
            <Kpi label="Average colour removal" value={<span><CountUp value={totals.avgColour} digits={1} />%</span>} />
            <Kpi label="Water reused" value={<span><CountUp value={totals.waterReusedPct} digits={1} />%</span>} note="90% of verified water returns to the dye line" />
            <Kpi label={feeLabel} value={<Money value={fee} />} live />
          </div>

          <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="font-display text-2xl font-extrabold text-ink">Treated and verified</h2>
            <p className="mt-1 text-base text-body">Blue is treated volume. Teal is verified volume.</p>
            <DailyVolumeChart data={totals.daily} />
          </section>

          <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="font-display text-2xl font-extrabold text-ink">COD in and COD out</h2>
            <p className="mt-1 text-base text-body">The dashed line is the 200 mg/L standard on the COD-out axis.</p>
            <CodChart data={totals.daily} />
          </section>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section>
              <h2 className="font-display text-2xl font-extrabold text-ink">Mill lines</h2>
              <div className="mt-3 grid gap-3">
                {mills
                  .filter((item) => view !== "mill" || item.id === millId)
                  .map((item) => {
                    const latest = latestBatch(rows, item);
                    return (
                      <article key={item.id} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-display text-xl font-extrabold text-ink">{item.name}, {item.line}</h3>
                            <p className="text-base text-body">{item.city} · {item.unitId}</p>
                          </div>
                          {latest ? <StatusPill status={latest.status} /> : <span className="text-base text-body">No batches</span>}
                        </div>
                        <p className="mt-3 text-base text-ink">Uptime {formatPct(item.uptime)}</p>
                        <p className="text-base text-body">
                          {latest ? (
                            <Link href={`/dashboard/batches/${latest.id}`} className="font-semibold text-teal underline-offset-4 hover:underline">
                              Last batch {latest.id} · {formatDateTime(latest.end)}
                            </Link>
                          ) : (
                            "No batch in this range"
                          )}
                        </p>
                      </article>
                    );
                  })}
              </div>
            </section>
            <section>
              <h2 className="font-display text-2xl font-extrabold text-ink">Alerts</h2>
              {alerts.length === 0 ? (
                <div className="mt-3">
                  <EmptyState title="No alerts" body="Nothing withheld, drifting, or overdue in this range." />
                </div>
              ) : (
                <ul className="mt-3 space-y-3">
                  {alerts.map((alert) => {
                    const Icon = alert.tone === "withheld" ? AlertTriangle : alert.tone === "review" ? Clock : Check;
                    return (
                      <li key={alert.id}>
                        <Link href={alert.href} className="flex min-h-11 gap-3 rounded-2xl border border-line bg-white p-4 shadow-card">
                          <Icon className={alert.tone === "withheld" ? "mt-1 h-5 w-5 text-dye" : "mt-1 h-5 w-5 text-ink"} aria-hidden="true" />
                          <span>
                            <span className="block font-semibold text-ink">{alert.title}</span>
                            <span className="mt-1 block text-base text-body">{alert.body}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="font-display text-2xl font-extrabold text-ink">Passports scanned</h2>
            <p className="mt-1 text-base text-body">{formatNumber(scans.reduce((sum, point) => sum + point.scans, 0))} scans in {rangePhrase(range)}.</p>
            <ScanChart data={scans} />
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  note,
  spark,
  color,
  live,
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
  spark?: number[];
  color?: string;
  live?: boolean;
}) {
  return (
    <article className="rise rounded-2xl border border-line bg-white p-4 shadow-card">
      <p className="text-base text-body">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink" aria-live={live ? "polite" : undefined}>
        {value}
      </p>
      {note ? <p className="mt-2 text-base text-body">{note}</p> : null}
      {spark && color ? (
        <div className="mt-3">
          <Sparkline values={spark} color={color} />
        </div>
      ) : null}
    </article>
  );
}
