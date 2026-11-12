"use client";

import Link from "next/link";
import { QrMark } from "@/components/QrMark";
import { Shirt } from "@/components/Shirt";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { dppPayload, type LinkedBatch } from "@/lib/dpp";
import { downloadJson } from "@/lib/csv";
import { garments, getBatch, millById } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { combinedStatus, presentBatch } from "@/lib/present";
import { useStore } from "@/lib/store";

export function Passports() {
  const { settings, view, millId, query } = useStore();
  const needle = query.trim().toLowerCase();
  const visible = garments.filter((garment) => {
    const linked = garment.batchIds
      .map((id) => getBatch(id))
      .filter((batch): batch is NonNullable<typeof batch> => Boolean(batch))
      .map((batch) => presentBatch(batch, settings.revokedIds));
    const primary = linked[0];
    if (!primary) return false;
    if (view === "mill" && primary.millId !== millId) return false;
    if (!needle) return true;
    return `${garment.name} ${garment.id} ${garment.colorName}`.toLowerCase().includes(needle);
  });

  function exportAll() {
    const payload = visible.map((garment) => {
      const linked: LinkedBatch[] = garment.batchIds.flatMap((id) => {
        const batch = getBatch(id);
        if (!batch) return [];
        const shown = presentBatch(batch, settings.revokedIds);
        const mill = millById(shown.millId);
        return [{ batch: shown, millName: mill.name, millLine: mill.line, millCity: mill.city, country: mill.country, unitId: mill.unitId }];
      });
      return dppPayload(garment, linked, combinedStatus(linked.map((item) => item.batch)));
    });
    downloadJson("clearthread-dpp.json", payload);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Garment passports</h1>
          <p className="mt-2 text-base text-body">{formatNumber(visible.length)} products in this view.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/passports/print" className="inline-flex min-h-11 items-center rounded-xl bg-teal px-4 font-semibold text-white">
            Print tag sheet
          </Link>
          <Button variant="secondary" onClick={exportAll} disabled={visible.length === 0}>
            Export DPP data (JSON)
          </Button>
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No passports" body="Nothing in this mill or search." />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((garment) => {
            const linked = garment.batchIds
              .map((id) => getBatch(id))
              .filter((batch): batch is NonNullable<typeof batch> => Boolean(batch))
              .map((batch) => presentBatch(batch, settings.revokedIds));
            const status = combinedStatus(linked);
            return (
              <li key={garment.id} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <Shirt color={garment.color} silhouette={garment.silhouette} title={garment.name} />
                  <QrMark path={`/p/${garment.id}`} size={96} label={`QR code for ${garment.name}`} />
                </div>
                <h2 className="mt-3 font-display text-2xl font-extrabold text-ink">{garment.name}</h2>
                <p className="text-base text-body">{garment.id}</p>
                <div className="mt-3">
                  <StatusPill status={status} />
                </div>
                <p className="mt-3 text-base text-body">{formatNumber(garment.scans)} scans</p>
                <Link href={`/p/${garment.id}`} className="mt-3 inline-flex min-h-11 items-center font-semibold text-teal underline-offset-4 hover:underline">
                  Open passport
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
