"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Check, Clock } from "lucide-react";
import { TraceChart } from "@/components/charts/Charts";
import { EmptyState } from "@/components/EmptyState";
import { QrMark } from "@/components/QrMark";
import { Seal } from "@/components/Seal";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { garments, getBatch, millById } from "@/lib/data";
import { formatDateTime, formatNumber, formatPct } from "@/lib/format";
import { presentBatch } from "@/lib/present";
import { useStore } from "@/lib/store";
import type { Batch } from "@/lib/types";

export function BatchDetail({ id }: { id: string }) {
  const { settings, revokeSeal, restoreSeal } = useStore();
  const raw = getBatch(id);
  const [confirm, setConfirm] = useState(false);
  const batch = useMemo(() => (raw ? presentBatch(raw, settings.revokedIds) : undefined), [raw, settings.revokedIds]);
  if (!batch) return <EmptyState title="Batch not found" body="This id is not in the demo record." />;
  const mill = millById(batch.millId);
  const linked = garments.filter((garment) => garment.batchIds.includes(batch.id));
  const checks = standardChecks(batch);
  const revoked = settings.revokedIds.includes(batch.id);

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard/batches" className="font-semibold text-teal underline-offset-4 hover:underline">
        All batches
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Batch {batch.id}</h1>
            <StatusPill status={batch.status} />
          </div>
          <p className="mt-2 text-base text-body">
            {mill.name}, {mill.line} · {mill.city} · {mill.unitId}
          </p>
          {batch.withholdReason ? <p className="mt-3 max-w-xl text-base font-semibold text-ink">{batch.withholdReason}</p> : null}
        </div>
        <Seal size="md" status={batch.status} animated={batch.status === "verified"} />
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Volume" value={`${formatNumber(batch.volumeM3)} m³`} />
        <Stat label="Colour removal" value={formatPct(batch.colourRemoval)} />
        <Stat label="COD in / out" value={`${formatNumber(batch.codIn)} → ${formatNumber(batch.codOut)} mg/L`} />
        <Stat label="Energy" value={`${formatNumber(batch.energyKwh, 1)} kWh`} />
      </dl>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <h2 className="font-display text-2xl font-extrabold text-ink">Sensor trace</h2>
        <p className="mt-1 text-base text-body">COD during treatment. The dashed line is 200 mg/L.</p>
        <TraceChart trace={batch.trace} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="font-display text-2xl font-extrabold text-ink">Sensor and laboratory</h2>
          <p className="mt-4 text-base text-body">Sensor COD out</p>
          <p className="font-display text-3xl font-extrabold text-ink">{formatNumber(batch.codOut)} mg/L</p>
          <p className="mt-4 text-base text-body">Laboratory cross-check</p>
          <p className="font-display text-3xl font-extrabold text-ink">{formatNumber(batch.labCod, 1)} mg/L</p>
          <p className="mt-4 flex items-center gap-2 text-base font-semibold text-ink">
            {batch.labDiffPct <= 10 ? <Check className="h-5 w-5 text-teal" aria-hidden="true" /> : <AlertTriangle className="h-5 w-5 text-dye" aria-hidden="true" />}
            {formatPct(batch.labDiffPct)} difference · {batch.labDiffPct <= 10 ? "Pass" : "Fail"}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="font-display text-2xl font-extrabold text-ink">Standard checks</h2>
          <ul className="mt-4 space-y-3">
            {checks.map((check) => {
              const Icon = check.state === "pass" ? Check : check.state === "pending" ? Clock : AlertTriangle;
              const word = check.state === "pass" ? "Pass" : check.state === "pending" ? "Pending" : "Fail";
              return (
                <li key={check.label} className="flex items-start gap-2">
                  <Icon className={check.state === "fail" ? "mt-0.5 h-5 w-5 text-dye" : "mt-0.5 h-5 w-5 text-ink"} aria-hidden="true" />
                  <span>
                    <span className="font-semibold text-ink">{check.label}: {word}</span>
                    <span className="mt-0.5 block text-base text-body">{check.detail}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <h2 className="font-display text-2xl font-extrabold text-ink">Audit trail</h2>
        <ol className="mt-4 space-y-4">
          {batch.trail.map((step) => (
            <li key={step.id} className="border-l-2 border-line pl-4">
              <p className="font-semibold text-ink">{step.label}</p>
              <p className="text-base text-body">{step.at ? formatDateTime(step.at) : "Pending"} · {step.hash}</p>
              <p className="text-base text-body">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold text-ink">Linked garments</h2>
          {linked.length > 0 ? (
            <Link href={`/dashboard/passports/print?ids=${linked.map((garment) => garment.id).join(",")}`} className="inline-flex min-h-11 items-center rounded-xl bg-teal px-4 font-semibold text-white">
              Generate QR tags
            </Link>
          ) : null}
        </div>
        {linked.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No garments" body="This batch is not linked to a passport in the demo." />
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {linked.map((garment) => (
              <li key={garment.id} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
                <QrMark path={`/p/${garment.id}`} size={88} label={`QR code for ${garment.name}`} />
                <div>
                  <Link href={`/p/${garment.id}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                    {garment.name}
                  </Link>
                  <p className="text-base text-body">{garment.id}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-2xl font-extrabold text-ink">Seal</h2>
        {revoked ? (
          <div className="mt-3">
            <p className="text-base text-body">This seal was revoked on this device.</p>
            <Button className="mt-3" variant="secondary" onClick={() => restoreSeal(batch.id)}>
              Restore seal
            </Button>
          </div>
        ) : batch.status === "verified" ? (
          <div className="mt-3">
            {confirm ? (
              <div>
                <p className="text-base text-body">Revoking removes the seal from linked passports and drops this volume from the bill. It stays revoked on this device until you reset demo data.</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="danger" onClick={() => revokeSeal(batch.id)}>
                    Confirm revoke
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirm(true)}>
                Revoke seal
              </Button>
            )}
          </div>
        ) : (
          <p className="mt-3 text-base text-body">Only a verified seal can be revoked.</p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <dt className="text-base text-body">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-extrabold text-ink">{value}</dd>
    </div>
  );
}

function standardChecks(batch: Batch) {
  const auditHours = batch.auditAt ? (Date.parse(batch.auditAt) - Date.parse(batch.end)) / 3_600_000 : null;
  return [
    {
      label: "COD out",
      state: batch.codOut <= 200 ? "pass" : "fail",
      detail: `${formatNumber(batch.codOut)} mg/L, standard ≤ 200`,
    },
    {
      label: "Colour removal",
      state: batch.colourRemoval >= 95 ? "pass" : "fail",
      detail: `${formatPct(batch.colourRemoval)}, standard ≥ 95%`,
    },
    {
      label: "Sensor and lab",
      state: batch.labDiffPct <= 10 ? "pass" : "fail",
      detail: `${formatPct(batch.labDiffPct)} apart, standard within ±10%`,
    },
    {
      label: "Audit timing",
      state: batch.auditAt ? (auditHours !== null && auditHours <= 72 ? "pass" : "fail") : "pending",
      detail: batch.auditAt ? `Signed ${formatNumber(auditHours ?? 0, 0)} hours after treatment` : "No sign-off yet",
    },
    {
      label: "Downstream test",
      state: "pass",
      detail: `Clean result ${formatDateTime(batch.downstream.at)}`,
    },
  ] as const;
}
