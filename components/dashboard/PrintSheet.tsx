"use client";

import Link from "next/link";
import { QrMark } from "@/components/QrMark";
import { Seal } from "@/components/Seal";
import { BRAND_NAME } from "@/lib/brand";
import { garments, getBatch } from "@/lib/data";
import { combinedStatus, presentBatch } from "@/lib/present";
import { useStore } from "@/lib/store";

export function PrintSheet({ ids }: { ids?: string }) {
  const { settings } = useStore();
  const wanted = new Set(
    (ids ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
  const tags = garments.filter((garment) => wanted.size === 0 || wanted.has(garment.id));

  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Hang tags</h1>
          <p className="mt-2 text-base text-body">Print this sheet on A4. Each QR uses this site&apos;s address.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/passports" className="inline-flex min-h-11 items-center rounded-xl border border-line bg-white px-4 font-semibold text-ink">
            Back
          </Link>
          <button type="button" className="inline-flex min-h-11 items-center rounded-xl bg-teal px-4 font-semibold text-white" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>
      <div className="tag-sheet grid gap-4 md:grid-cols-2">
        {tags.map((garment) => {
          const linked = garment.batchIds
            .map((id) => getBatch(id))
            .filter((batch): batch is NonNullable<typeof batch> => Boolean(batch))
            .map((batch) => presentBatch(batch, settings.revokedIds));
          const status = combinedStatus(linked);
          return (
            <article key={garment.id} className="hang-tag flex flex-col items-center rounded-2xl border border-line bg-white p-4 text-center">
              <Seal size="md" status={status} decorative />
              <h2 className="mt-3 font-display text-2xl font-extrabold text-ink">{garment.name}</h2>
              <p className="text-base text-body">{BRAND_NAME}</p>
              {status === "withheld" ? <p className="mt-1 font-semibold text-ink">No ClearThread seal</p> : null}
              <div className="mt-3">
                <QrMark path={`/p/${garment.id}`} size={168} label={`QR code for ${garment.name}`} />
              </div>
              <p className="text-base font-semibold text-ink">Scan to see this shirt&apos;s water story</p>
              <p className="text-base text-body">{garment.id}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
