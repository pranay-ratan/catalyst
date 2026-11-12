"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";
import { millById, mills } from "@/lib/data";
import { formatDateTime, formatNumber, formatPct } from "@/lib/format";
import { inRange } from "@/lib/range";
import { useStore } from "@/lib/store";
import { useWorkingBatches } from "@/lib/use-batches";
import type { Batch, Status } from "@/lib/types";

const columnHelper = createColumnHelper<Batch>();

export function BatchesTable() {
  const router = useRouter();
  const { range, setQuery } = useStore();
  const source = useWorkingBatches();
  const [status, setStatus] = useState<"all" | Status>("all");
  const [mill, setMill] = useState("all");
  const [dateCut, setDateCut] = useState<"all" | "7d" | "30d">("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "start", desc: true }]);

  const rows = useMemo(
    () =>
      source.filter((batch) => {
        if (!inRange(batch.start, range)) return false;
        if (dateCut !== "all" && !inRange(batch.start, dateCut)) return false;
        if (status !== "all" && batch.status !== status) return false;
        if (mill !== "all" && batch.millId !== mill) return false;
        return true;
      }),
    [source, range, dateCut, status, mill],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", { header: "Batch" }),
      columnHelper.accessor((batch) => `${millById(batch.millId).name}, ${millById(batch.millId).line}`, { id: "mill", header: "Mill" }),
      columnHelper.accessor("start", {
        header: "Started",
        cell: (info) => formatDateTime(info.getValue()),
        sortingFn: "datetime",
      }),
      columnHelper.accessor("volumeM3", {
        header: "Volume",
        cell: (info) => `${formatNumber(info.getValue())} m³`,
      }),
      columnHelper.accessor("colourRemoval", {
        header: "Colour removal",
        cell: (info) => formatPct(info.getValue()),
      }),
      columnHelper.accessor("codOut", {
        header: "COD out",
        cell: (info) => `${formatNumber(info.getValue())} mg/L`,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusPill status={info.getValue()} />,
      }),
    ],
    [],
  );

  // TanStack Table returns functions that the React compiler cannot memoize.
  // eslint-disable-next-line react-hooks/incompatible-library -- table instance is local to this component
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function exportCsv() {
    const header = ["Batch", "Mill", "Line", "Unit", "Start", "End", "Volume m3", "Colour removal %", "COD in", "COD out", "Status", "Reason"];
    const body = table.getRowModel().rows.map((row) => {
      const batch = row.original;
      const site = millById(batch.millId);
      return [batch.id, site.name, site.line, site.unitId, batch.start, batch.end, batch.volumeM3, batch.colourRemoval, batch.codIn, batch.codOut, batch.status, batch.withholdReason ?? ""];
    });
    downloadCsv("clearthread-batches.csv", [header, ...body]);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Batches</h1>
          <p className="mt-2 text-base text-body">{formatNumber(rows.length)} reports in this view.</p>
        </div>
        <Button variant="secondary" onClick={exportCsv} disabled={rows.length === 0}>
          Export CSV
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="text-base font-semibold text-ink">
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value as "all" | Status)} className="mt-1 block h-11 rounded-xl border border-line bg-white px-3 font-normal">
            <option value="all">All statuses</option>
            <option value="verified">Verified</option>
            <option value="review">Under review</option>
            <option value="withheld">Withheld</option>
          </select>
        </label>
        <label className="text-base font-semibold text-ink">
          Mill
          <select value={mill} onChange={(event) => setMill(event.target.value)} className="mt-1 block h-11 rounded-xl border border-line bg-white px-3 font-normal">
            <option value="all">All mills</option>
            {mills.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-base font-semibold text-ink">
          Date
          <select value={dateCut} onChange={(event) => setDateCut(event.target.value as "all" | "7d" | "30d")} className="mt-1 block h-11 rounded-xl border border-line bg-white px-3 font-normal">
            <option value="all">Any date in range</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </label>
      </div>
      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No batches match"
            body="Clear the search or widen the filters."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setStatus("all");
                  setMill("all");
                  setDateCut("all");
                  setQuery("");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full min-w-[760px] border-collapse text-left text-base">
            <caption className="sr-only">Batch reports</caption>
            <thead className="bg-mist text-ink">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th key={header.id} scope="col" aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"} className="px-3 py-3 font-semibold">
                        <button type="button" className="min-h-11 font-semibold" onClick={header.column.getToggleSortingHandler()}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? " ↑" : sorted === "desc" ? " ↓" : ""}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  tabIndex={0}
                  className="cursor-pointer border-t border-line hover:bg-paper"
                  onClick={() => router.push(`/dashboard/batches/${row.original.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/dashboard/batches/${row.original.id}`);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
