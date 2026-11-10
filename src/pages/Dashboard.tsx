import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BATCHES } from '../data/batches';
import { QrTag } from '../components/QrTag';
import { batchesToCsv } from '../lib/csv';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate, formatNumber } from '../lib/format';
import { passportPath } from '../lib/links';
import {
  countByStatus,
  filterBatches,
  labResultPasses,
  STATUS_LABEL,
  STATUS_ORDER,
  uniqueMills,
  waterTotals,
} from '../lib/status';
import type { Batch, BatchStatus } from '../types';

type StatusFilter = BatchStatus | 'all';

const CSV_FILENAME = 'clearthread-batches.csv';

/** Downloads the given batch rows as a CSV file. Runs only from a click handler. */
function downloadCsv(batches: readonly Batch[]): void {
  const blob = new Blob([batchesToCsv(batches)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = CSV_FILENAME;
  link.click();
  URL.revokeObjectURL(url);
}

export function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [millFilter, setMillFilter] = useState<string>('all');
  const [tagBatchId, setTagBatchId] = useState<string | null>(null);

  const counts = countByStatus(BATCHES);
  const totals = waterTotals(BATCHES);
  const mills = uniqueMills(BATCHES);
  const rows = filterBatches(BATCHES, { status: statusFilter, mill: millFilter });
  const tagBatch = BATCHES.find((batch) => batch.id === tagBatchId) ?? null;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl">Brand dashboard</h1>
        <p className="text-base text-muted">Example Apparel Co. and Sample Threads Ltd. batches (demo data).</p>
      </header>

      <section aria-label="Water impact" className="space-y-3 rounded-lg border-2 border-indigo bg-white/70 p-5">
        <h2 className="text-xl">Water impact across these batches</h2>
        <p className="text-base">
          <span className="text-3xl font-bold text-indigo">{formatNumber(totals.litersTreated)} L</span> of dye
          wastewater treated, and <span className="font-bold">{formatNumber(totals.litersReused)} L</span> reused (
          {totals.reusePercent}%).
        </p>
        <p className="text-base text-muted">
          Every figure comes from the batch records shown below. Demo data, not real test results.
        </p>
      </section>

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryTile label="Batches" value={counts.total} />
        <SummaryTile label="Verified" value={counts.verified} status="verified" />
        <SummaryTile label="Under review" value={counts.review} status="review" />
        <SummaryTile label="Withheld" value={counts.withheld} status="withheld" />
      </section>

      <section aria-label="Filters" className="flex flex-col gap-4 sm:flex-row">
        <label className="flex flex-col gap-1 text-base font-bold">
          Status
          <select
            className="min-h-[44px] rounded-md border border-ink/40 bg-white px-3 py-2 font-normal"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-base font-bold">
          Mill
          <select
            className="min-h-[44px] rounded-md border border-ink/40 bg-white px-3 py-2 font-normal"
            value={millFilter}
            onChange={(event) => setMillFilter(event.target.value)}
          >
            <option value="all">All mills</option>
            {mills.map((mill) => (
              <option key={mill} value={mill}>
                {mill}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base text-muted" aria-live="polite">
          Showing {rows.length} of {BATCHES.length} batches.
        </p>
        <button
          type="button"
          onClick={() => downloadCsv(rows)}
          disabled={rows.length === 0}
          className="min-h-[44px] rounded-md border-2 border-indigo px-4 py-2 text-base font-bold text-indigo hover:bg-indigo hover:text-linen disabled:opacity-50"
        >
          Download CSV
        </button>
      </div>

      <BatchTable rows={rows} onPrintTag={setTagBatchId} />
      <BatchCards rows={rows} onPrintTag={setTagBatchId} />

      {tagBatch ? (
        <section aria-label="Printable QR tag" className="space-y-4 border-t border-ink/15 pt-8">
          <div className="no-print flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[44px] rounded-md bg-indigo px-5 py-2 text-base font-bold text-linen hover:bg-ink"
            >
              Print this tag
            </button>
            <p className="text-base text-muted">Tag for {tagBatch.id}. Print or save as PDF.</p>
          </div>
          <QrTag batch={tagBatch} />
        </section>
      ) : null}
    </div>
  );
}

interface SummaryTileProps {
  label: string;
  value: number;
  status?: BatchStatus;
}

function SummaryTile({ label, value, status }: SummaryTileProps) {
  return (
    <div className="rounded-lg border border-ink/15 bg-white/70 p-4">
      <p className="text-base text-muted">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-3xl font-bold text-indigo">
        {value}
        {status ? <StatusBadge status={status} /> : null}
      </p>
    </div>
  );
}

interface BatchListProps {
  rows: Batch[];
  onPrintTag: (batchId: string) => void;
}

function BatchTable({ rows, onPrintTag }: BatchListProps) {
  const navigate = useNavigate();
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left text-base">
        <thead>
          <tr className="border-b-2 border-indigo text-indigo">
            <th scope="col" className="py-3 pr-3">Batch ID</th>
            <th scope="col" className="py-3 pr-3">Mill</th>
            <th scope="col" className="py-3 pr-3">Date</th>
            <th scope="col" className="py-3 pr-3 text-right">Liters treated</th>
            <th scope="col" className="py-3 pr-3">Lab result</th>
            <th scope="col" className="py-3 pr-3">Status</th>
            <th scope="col" className="py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((batch) => (
            <tr
              key={batch.id}
              className="cursor-pointer border-b border-ink/15 hover:bg-white/70"
              onClick={() => navigate(passportPath(batch.id))}
            >
              <td className="py-3 pr-3 font-bold">
                <Link to={passportPath(batch.id)} onClick={(event) => event.stopPropagation()}>
                  {batch.id}
                </Link>
              </td>
              <td className="py-3 pr-3">{batch.mill}</td>
              <td className="py-3 pr-3">{formatDate(batch.treatedOn)}</td>
              <td className="py-3 pr-3 text-right">{formatNumber(batch.litersTreated)}</td>
              <td className="py-3 pr-3">
                <LabSummary batch={batch} />
              </td>
              <td className="py-3 pr-3">
                <StatusBadge status={batch.status} />
              </td>
              <td className="py-3">
                <PrintButton batch={batch} onPrintTag={onPrintTag} />
              </td>
            </tr>
          ))}
          {rows.length === 0 ? <EmptyRow /> : null}
        </tbody>
      </table>
    </div>
  );
}

function BatchCards({ rows, onPrintTag }: BatchListProps) {
  return (
    <ul className="space-y-3 md:hidden" aria-label="Batches">
      {rows.map((batch) => (
        <li key={batch.id} className="rounded-lg border border-ink/15 bg-white/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <Link to={passportPath(batch.id)} className="text-lg font-bold">
              {batch.id}
            </Link>
            <StatusBadge status={batch.status} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-base">
            <dt className="text-muted">Mill</dt>
            <dd>{batch.mill}</dd>
            <dt className="text-muted">Date</dt>
            <dd>{formatDate(batch.treatedOn)}</dd>
            <dt className="text-muted">Liters treated</dt>
            <dd>{formatNumber(batch.litersTreated)}</dd>
            <dt className="text-muted">Lab result</dt>
            <dd>
              <LabSummary batch={batch} />
            </dd>
          </dl>
          <div className="mt-3">
            <PrintButton batch={batch} onPrintTag={onPrintTag} />
          </div>
        </li>
      ))}
      {rows.length === 0 ? <li className="text-base text-muted">No batches match these filters.</li> : null}
    </ul>
  );
}

function LabSummary({ batch }: { batch: Batch }) {
  const passes = labResultPasses(batch);
  return (
    <span>
      {batch.pollutant}: {formatNumber(batch.afterValue)} {batch.unit} after, limit {formatNumber(batch.afterLimit)}{' '}
      {batch.unit} ({passes ? 'within limit' : 'above limit'})
    </span>
  );
}

function PrintButton({ batch, onPrintTag }: { batch: Batch; onPrintTag: (batchId: string) => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        // Stop the table row's click-to-open-passport handler from also firing.
        event.stopPropagation();
        onPrintTag(batch.id);
      }}
      className="min-h-[44px] rounded-md border-2 border-indigo px-3 py-1 text-base font-bold text-indigo hover:bg-indigo hover:text-linen"
    >
      Print QR tag<span className="sr-only"> for {batch.id}</span>
    </button>
  );
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={7} className="py-6 text-muted">
        No batches match these filters.
      </td>
    </tr>
  );
}
