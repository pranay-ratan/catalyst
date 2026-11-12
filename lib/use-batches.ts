"use client";

import { useMemo } from "react";
import { batches } from "@/lib/data";
import { matchesQuery, presentBatch } from "@/lib/metrics";
import { useStore } from "@/lib/store";
import type { Batch } from "@/lib/types";

export function useProgrammeBatches(): Batch[] {
  const { settings, view, millId } = useStore();
  return useMemo(
    () =>
      batches
        .map((batch) => presentBatch(batch, settings.revokedIds))
        .filter((batch) => (view === "mill" ? batch.millId === millId : true)),
    [settings.revokedIds, view, millId],
  );
}

export function useWorkingBatches(): Batch[] {
  const { settings, view, millId, query } = useStore();
  return useMemo(
    () =>
      batches
        .map((batch) => presentBatch(batch, settings.revokedIds))
        .filter((batch) => (view === "mill" ? batch.millId === millId : true))
        .filter((batch) => matchesQuery(batch, query)),
    [settings.revokedIds, view, millId, query],
  );
}
