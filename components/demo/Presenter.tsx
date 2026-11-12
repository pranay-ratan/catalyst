"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DailyVolumeChart } from "@/components/charts/Charts";
import { CountUp, Cubic, Money } from "@/components/CountUp";
import { PageFrame } from "@/components/PageFrame";
import { QrMark } from "@/components/QrMark";
import { Seal } from "@/components/Seal";
import { StatusPill } from "@/components/StatusPill";
import { batches, getGarment, millById } from "@/lib/data";
import { DEMO_CYCLE } from "@/lib/ids";
import { formatNumber } from "@/lib/format";
import { splitFees, totalsFor } from "@/lib/metrics";
import { useStore } from "@/lib/store";
import type { Status } from "@/lib/types";

const LIVE_VOLUMES = [32, 44, 28, 51, 36, 40];
const LIVE_MILLS = ["sonali", "meghna", "rupa"];

export function Presenter() {
  const { settings } = useStore();
  const [tick, setTick] = useState(0);
  const [cycle, setCycle] = useState(0);
  const base = useMemo(() => totalsFor(batches, "month"), []);
  const added = LIVE_VOLUMES.slice(0, tick).reduce((sum, volume) => sum + volume, 0);
  const treated = base.treatedM3 + added;
  const verified = base.verifiedM3 + added;
  const reports = base.batchCount + tick;
  const fees = splitFees(verified, settings.feeRate, settings.clearThreadShare);
  const garmentId = DEMO_CYCLE[cycle] ?? DEMO_CYCLE[0];
  const garment = getGarment(garmentId);
  const status: Status = cycle === 0 ? "verified" : cycle === 1 ? "review" : "withheld";
  const liveMill = millById(LIVE_MILLS[tick % LIVE_MILLS.length] ?? "sonali");
  const daily = base.daily.map((point, index, all) =>
    index === all.length - 1 ? { ...point, treated: point.treated + added, verified: point.verified + added } : point,
  );

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 4000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (event.key === " ") {
        event.preventDefault();
        setCycle((value) => (value + 1) % DEMO_CYCLE.length);
      }
      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        if (!document.fullscreenElement) {
          void document.documentElement.requestFullscreen().catch(() => undefined);
        } else {
          void document.exitFullscreen().catch(() => undefined);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <PageFrame className="bg-paper">
      <div className="grid min-h-full lg:grid-cols-[3fr_2fr]">
        <section className="border-b border-line p-6 lg:border-b-0 lg:border-r lg:p-8">
          <p className="text-base font-semibold text-teal">ClearThread live</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">Northline Apparel</h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Tile label="Treated" value={<Cubic value={treated} />} />
            <Tile label="Verified" value={<Cubic value={verified} />} />
            <Tile label="Batch reports" value={<CountUp value={reports} />} />
          </div>
          <p className="mt-3 text-base text-body">
            Fees accrued <Money value={fees.total} />
          </p>
          <div className="mt-4 rounded-2xl border border-line bg-white p-4">
            <DailyVolumeChart data={daily} />
          </div>
          <motion.p key={tick} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-base text-ink" aria-live="polite">
            {tick === 0
              ? "Latest verified batch is on the record."
              : `Latest batch A-${2600 + tick} · ${liveMill.name} · ${formatNumber(LIVE_VOLUMES[(tick - 1) % LIVE_VOLUMES.length] ?? 0)} m³ · Verified`}
          </motion.p>
        </section>
        <section className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <Seal size="md" status={status} animated={status === "verified"} />
          <div className="mt-4">
            <StatusPill status={status} label={status === "verified" ? "ClearThread Verified" : status === "review" ? "Under review" : "Withheld"} />
          </div>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-ink">{garment?.name}</h2>
          <div className="mt-6">
            <QrMark path={`/p/${garmentId}`} size={280} label={`QR code for ${garment?.name ?? "garment"}`} />
          </div>
          <p className="mt-4 text-lg font-semibold text-ink">Scan me with your phone camera</p>
          <p className="mt-2 text-base text-body">Space cycles status. F toggles fullscreen.</p>
        </section>
      </div>
    </PageFrame>
  );
}

function Tile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <p className="text-base text-body">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink">{value}</p>
    </article>
  );
}
