"use client";

import { Button } from "@/components/ui/button";
import { GOVERNANCE } from "@/lib/brand";
import { STANDARD_RULES } from "@/lib/standards";
import { useStore } from "@/lib/store";

export function Settings() {
  const { settings, setFeeRate, setClearThreadShare, resetDemo } = useStore();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">Settings</h1>
      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <h2 className="font-display text-2xl font-extrabold text-ink">Fee rate</h2>
        <label htmlFor="fee-rate" className="mt-3 block text-base font-semibold text-ink">
          US$ per verified m³
          <input
            id="fee-rate"
            type="number"
            min={0}
            max={999}
            step={0.01}
            value={settings.feeRate}
            onChange={(event) => {
              const parsed = event.target.valueAsNumber;
              if (Number.isFinite(parsed)) setFeeRate(parsed);
            }}
            className="mt-2 h-11 w-full max-w-xs rounded-xl border border-line px-3 text-base font-normal"
          />
        </label>
        <p className="mt-2 text-base text-body">Billing and the overview fee update as you type. The rate stays on this device.</p>
      </section>
      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <h2 className="font-display text-2xl font-extrabold text-ink">Revenue split</h2>
        <label htmlFor="split" className="mt-3 block font-semibold text-ink">
          ClearThread share: {settings.clearThreadShare}%
          <input
            id="split"
            type="range"
            min={0}
            max={100}
            value={settings.clearThreadShare}
            onChange={(event) => setClearThreadShare(Number(event.target.value))}
            className="mt-3 block w-full"
          />
        </label>
        <p className="mt-2 text-base text-body">Viridis receives {100 - settings.clearThreadShare}% for running the units.</p>
      </section>
      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <h2 className="font-display text-2xl font-extrabold text-ink">Standard thresholds</h2>
        <p className="mt-2 text-base text-body">Set by the standards board. {GOVERNANCE}.</p>
        <ul className="mt-4 space-y-2">
          {STANDARD_RULES.map((rule) => (
            <li key={rule.id} className="flex items-center justify-between gap-3 rounded-xl bg-mist px-3 py-3">
              <span className="text-ink">{rule.title}</span>
              <span className="font-semibold text-ink">{rule.rule}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-display text-2xl font-extrabold text-ink">Demo data</h2>
        <p className="mt-2 text-base text-body">
          {settings.concerns.length} concern{settings.concerns.length === 1 ? "" : "s"} saved on this device. {settings.revokedIds.length} seal
          {settings.revokedIds.length === 1 ? "" : "s"} revoked.
        </p>
        <Button className="mt-4" variant="secondary" onClick={() => resetDemo()}>
          Reset demo data
        </Button>
      </section>
    </div>
  );
}
