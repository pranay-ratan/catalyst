"use client";

import { MotionConfig } from "framer-motion";
import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { DEFAULT_CLEARTHREAD_SHARE, DEFAULT_FEE_RATE } from "@/lib/brand";
import type { RangeKey, ViewAs } from "@/lib/types";

const STORAGE_KEY = "clearthread-demo-v1";

export interface Concern {
  id: string;
  garmentId: string;
  message: string;
  contact: string;
  createdAt: string;
}

export interface PersistedState {
  feeRate: number;
  clearThreadShare: number;
  revokedIds: string[];
  concerns: Concern[];
}

export const DEFAULT_STATE: PersistedState = {
  feeRate: DEFAULT_FEE_RATE,
  clearThreadShare: DEFAULT_CLEARTHREAD_SHARE,
  revokedIds: [],
  concerns: [],
};

const SERVER_SNAPSHOT = JSON.stringify(DEFAULT_STATE);
let memory = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function isConcern(value: unknown): value is Concern {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Concern>;
  return (
    typeof item.id === "string" &&
    typeof item.garmentId === "string" &&
    typeof item.message === "string" &&
    typeof item.contact === "string" &&
    typeof item.createdAt === "string"
  );
}

function sanitize(value: unknown): PersistedState {
  if (!value || typeof value !== "object") return DEFAULT_STATE;
  const record = value as Partial<PersistedState>;
  const feeRate =
    typeof record.feeRate === "number" && Number.isFinite(record.feeRate) && record.feeRate >= 0 && record.feeRate <= 999
      ? Math.round(record.feeRate * 100) / 100
      : DEFAULT_STATE.feeRate;
  const clearThreadShare =
    typeof record.clearThreadShare === "number" && record.clearThreadShare >= 0 && record.clearThreadShare <= 100
      ? Math.round(record.clearThreadShare)
      : DEFAULT_STATE.clearThreadShare;
  const revokedIds = Array.isArray(record.revokedIds)
    ? [...new Set(record.revokedIds.filter((id): id is string => typeof id === "string"))]
    : [];
  const concerns = Array.isArray(record.concerns) ? record.concerns.filter(isConcern).slice(0, 50) : [];
  return { feeRate, clearThreadShare, revokedIds, concerns };
}

function readStorage(): string {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SERVER_SNAPSHOT;
    return JSON.stringify(sanitize(JSON.parse(raw)));
  } catch {
    return SERVER_SNAPSHOT;
  }
}

if (typeof window !== "undefined") memory = readStorage();

function write(next: PersistedState) {
  memory = JSON.stringify(sanitize(next));
  try {
    window.localStorage.setItem(STORAGE_KEY, memory);
  } catch {
    // Storage can be blocked. The session still keeps the change in memory.
  }
  for (const listener of listeners) listener();
}

function update(partial: Partial<PersistedState>) {
  write({ ...sanitize(JSON.parse(memory)), ...partial });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    memory = readStorage();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

interface StoreValue {
  settings: PersistedState;
  range: RangeKey;
  setRange: (range: RangeKey) => void;
  view: ViewAs;
  setView: (view: ViewAs) => void;
  millId: string;
  setMillId: (millId: string) => void;
  query: string;
  setQuery: (query: string) => void;
  setFeeRate: (feeRate: number) => void;
  setClearThreadShare: (share: number) => void;
  revokeSeal: (batchId: string) => void;
  restoreSeal: (batchId: string) => void;
  addConcern: (input: { garmentId: string; message: string; contact: string }) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const json = useSyncExternalStore(subscribe, () => memory, () => SERVER_SNAPSHOT);
  const settings = useMemo(() => sanitize(JSON.parse(json)), [json]);
  const [range, setRange] = useState<RangeKey>("month");
  const [view, setView] = useState<ViewAs>("brand");
  const [millId, setMillId] = useState("sonali");
  const [query, setQuery] = useState("");

  const value = useMemo<StoreValue>(
    () => ({
      settings,
      range,
      setRange,
      view,
      setView,
      millId,
      setMillId,
      query,
      setQuery,
      setFeeRate: (feeRate) => {
        if (!Number.isFinite(feeRate) || feeRate < 0 || feeRate > 999) return;
        update({ feeRate: Math.round(feeRate * 100) / 100 });
      },
      setClearThreadShare: (share) => {
        if (!Number.isFinite(share)) return;
        update({ clearThreadShare: Math.min(100, Math.max(0, Math.round(share))) });
      },
      revokeSeal: (batchId) => {
        const current = sanitize(JSON.parse(memory));
        if (current.revokedIds.includes(batchId)) return;
        update({ revokedIds: [...current.revokedIds, batchId] });
      },
      restoreSeal: (batchId) => {
        const current = sanitize(JSON.parse(memory));
        update({ revokedIds: current.revokedIds.filter((id) => id !== batchId) });
      },
      addConcern: (input) => {
        const current = sanitize(JSON.parse(memory));
        const concern: Concern = {
          id: `c-${Date.now()}`,
          garmentId: input.garmentId,
          message: input.message.trim(),
          contact: input.contact.trim(),
          createdAt: new Date().toISOString(),
        };
        if (!concern.message) return;
        update({ concerns: [concern, ...current.concerns].slice(0, 50) });
      },
      resetDemo: () => write(DEFAULT_STATE),
    }),
    [settings, range, view, millId, query],
  );

  return (
    <MotionConfig reducedMotion="user">
      <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
    </MotionConfig>
  );
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within Providers");
  return value;
}
