"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useId, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Clock, Flag, Share2 } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { Seal } from "@/components/Seal";
import { Shirt } from "@/components/Shirt";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { AUDITOR_NAME, BRAND_NAME, MONITOR_NAME } from "@/lib/brand";
import { dppPayload, type LinkedBatch } from "@/lib/dpp";
import { downloadJson } from "@/lib/csv";
import { daysBefore, formatDate, formatNumber, formatPct } from "@/lib/format";
import { combinedStatus, presentBatch } from "@/lib/present";
import { useStore } from "@/lib/store";
import type { Garment } from "@/lib/types";

const TraceChart = dynamic(() => import("@/components/charts/Charts").then((mod) => mod.TraceChart), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl bg-mist" />,
});

export function PassportView({ garment, sources }: { garment: Garment; sources: LinkedBatch[] }) {
  const { settings, addConcern } = useStore();
  const linked = sources.map((item) => ({ ...item, batch: presentBatch(item.batch, settings.revokedIds) }));
  const primary = linked[0];
  const [story, setStory] = useState(0);
  const [recordOpen, setRecordOpen] = useState(false);
  const [meaningOpen, setMeaningOpen] = useState(false);
  const [concernOpen, setConcernOpen] = useState(false);
  const [dppOpen, setDppOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!primary) return null;
  const { batch } = primary;
  const status = combinedStatus(linked.map((item) => item.batch));
  const reason = linked.find((item) => item.batch.withholdReason)?.batch.withholdReason;
  const steps = [
    {
      title: "Cotton grown",
      when: formatDate(daysBefore(batch.start, 120)),
      detail: garment.cottonOrigin,
    },
    {
      title: "Spun",
      when: formatDate(daysBefore(batch.start, 21)),
      detail: `${garment.spunAt}. Yarn lot ${garment.yarnLot}.`,
    },
    {
      title: `Dyed at ${primary.millName}, ${primary.millCity}`,
      when: formatDate(batch.start),
      detail: `${primary.millLine} · batch ${batch.id} · ${garment.colorName.toLowerCase()} dye.`,
    },
    {
      title: `Water cleaned by Viridis unit ${primary.unitId}`,
      when: formatDate(batch.end),
      detail: `${formatNumber(batch.volumeM3)} m³ treated in this batch. ${garment.waterLitres} L of cleaned water is allocated to this garment. Colour removal ${formatPct(batch.colourRemoval)}. COD ${formatNumber(batch.codIn)} mg/L in, ${formatNumber(batch.codOut)} mg/L out.`,
    },
    {
      title: "Independently audited",
      when: batch.auditAt ? formatDate(batch.auditAt) : "Pending",
      detail: batch.auditAt
        ? `${AUDITOR_NAME}. Reference ${batch.auditRef}. ${batch.downstream.note}`
        : "Results pending audit. The seal is not issued until the auditor signs.",
    },
  ];

  async function share() {
    const url = window.location.href;
    const title = `${garment.name} · ClearThread`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url, text: `${garment.name} water passport` });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="mx-auto w-full max-w-lg px-5 py-8">
      <p className="text-base font-semibold text-teal">ClearThread</p>
      <div className="mt-6 flex flex-col items-center text-center">
        {status === "withheld" ? (
          <Seal size="lg" status="withheld" />
        ) : (
          <Seal size="lg" status={status} animated={status === "verified"} />
        )}
        <motion.div
          className="mt-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <StatusPill
            status={status}
            label={status === "verified" ? "ClearThread Verified" : status === "review" ? "Under review" : "Withheld"}
          />
        </motion.div>
        {status === "review" ? <p className="mt-3 text-base font-semibold text-ink">Results pending audit</p> : null}
        {status === "withheld" ? (
          <p className="mt-3 max-w-sm text-base font-semibold text-ink">This garment does not carry the ClearThread seal.</p>
        ) : null}
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink">{garment.name}</h1>
        <p className="mt-2 text-base text-body">{BRAND_NAME}</p>
        <div className="mt-4">
          <Shirt color={garment.color} silhouette={garment.silhouette} title={`${garment.colorName} ${garment.name}`} />
        </div>
      </div>

      {status === "withheld" && reason ? (
        <div className="mt-6 flex gap-3 rounded-2xl border border-dye/30 bg-white p-4 text-left">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-dye" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">Withheld</p>
            <p className="mt-1 text-base text-body">{reason}</p>
          </div>
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-2xl font-extrabold text-ink">This shirt&apos;s water story</h2>
        <ol className="mt-4 space-y-3">
          {steps.map((step, index) => {
            const open = story === index;
            return (
              <li key={step.title}>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-start gap-3 rounded-2xl border border-line bg-white p-4 text-left"
                  aria-expanded={open}
                  onClick={() => setStory(open ? -1 : index)}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist font-semibold text-ink">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{step.title}</span>
                    <span className="mt-1 block text-base text-body">{step.when}</span>
                    {open ? <span className="mt-2 block text-base text-body">{step.detail}</span> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-10 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-2xl font-extrabold text-ink">Impact</h2>
        <div className="mt-4 flex items-center gap-4">
          <FillingDrop />
          <p className="font-display text-4xl font-extrabold leading-none tracking-tight text-ink">
            <CountUp value={garment.waterLitres} />
            <span className="text-2xl"> L</span>
          </p>
        </div>
        <p className="mt-3 text-base text-body">of water cleaned and reused for this shirt</p>
        <p className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink">{formatPct(batch.colourRemoval)}</p>
        <p className="text-base text-body">of dye colour removed</p>
        <div className="mt-6 space-y-4">
          <CodBar label="COD before" value={batch.codIn} max={Math.max(batch.codIn, batch.codOut)} tone="water" />
          <CodBar label="COD after" value={batch.codOut} max={Math.max(batch.codIn, batch.codOut)} tone={batch.codOut > 200 ? "dye" : "teal"} />
        </div>
        <p className="mt-3 text-base text-body">The standard is 200 mg/L or lower after treatment.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-extrabold text-ink">Proof</h2>
        {status === "withheld" ? (
          <p className="mt-3 text-base text-body">The checks below did not all pass, so there is no seal on this garment.</p>
        ) : null}
        <ul className="mt-4 space-y-3">
          <Proof
            ok={batch.codOut <= 200 && batch.colourRemoval >= 95}
            pending={false}
            title="Machine checked every reading"
            body={
              batch.codOut <= 200 && batch.colourRemoval >= 95
                ? "The unit sensor logged the batch from start to finish."
                : "The sensor record did not meet the COD or colour rule."
            }
          />
          <Proof
            ok={status === "verified"}
            pending={status === "review"}
            title={status === "review" ? "Independent audit pending" : status === "verified" ? "Independent audit passed" : "Independent audit withheld the seal"}
            body={status === "review" ? "Results pending audit." : status === "verified" ? `${AUDITOR_NAME} signed ${batch.auditRef}.` : (reason ?? "The audit did not pass.")}
          />
          <Proof
            ok
            pending={false}
            title="Downstream community test: clean"
            body={`${MONITOR_NAME} recorded a clean result on ${formatDate(batch.downstream.at)}.`}
          />
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-2xl font-extrabold text-ink">Verify yourself</h2>
        <dl className="mt-4 space-y-3 text-base">
          <div className="flex justify-between gap-4">
            <dt className="text-body">Batch</dt>
            <dd className="font-semibold text-ink">{batch.id}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-body">Audit reference</dt>
            <dd className="font-semibold text-ink">{batch.auditAt ? batch.auditRef : "Pending"}</dd>
          </div>
        </dl>
        <Button className="mt-4 w-full" variant="secondary" onClick={() => setRecordOpen(true)}>
          View the batch record
        </Button>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white">
        <button type="button" className="flex min-h-11 w-full items-center justify-between px-5 py-4 text-left font-semibold text-ink" aria-expanded={dppOpen} onClick={() => setDppOpen((open) => !open)}>
          EU Digital Product Passport ready
          <span aria-hidden="true">{dppOpen ? "–" : "+"}</span>
        </button>
        {dppOpen ? (
          <div className="border-t border-line px-5 py-4 text-base text-body">
            <ul className="space-y-2">
              <li>Product ID: {garment.id}</li>
              <li>Materials: {garment.material}</li>
              <li>Facility: {primary.millName}, {primary.millCity}</li>
              <li>Batch: {linked.map((item) => item.batch.id).join(", ")}</li>
              <li>Water data: {garment.waterLitres} L cleaned for this garment</li>
            </ul>
            <Button
              className="mt-4 w-full"
              variant="secondary"
              onClick={() => downloadJson(`${garment.id}-dpp.json`, dppPayload(garment, linked, status))}
            >
              Download passport data (JSON)
            </Button>
          </div>
        ) : null}
      </section>

      <div className="mt-8 grid gap-3">
        <Button variant="secondary" onClick={() => setMeaningOpen(true)}>What this seal means</Button>
        <Button variant="secondary" onClick={() => void share()}>
          <Share2 className="h-5 w-5" aria-hidden="true" />
          {copied ? "Link copied" : "Share"}
        </Button>
        <Button variant="secondary" onClick={() => setConcernOpen(true)}>
          <Flag className="h-5 w-5" aria-hidden="true" />
          Report a concern
        </Button>
        <Link href="/scan" className="inline-flex min-h-11 items-center justify-center rounded-xl text-base font-semibold text-teal underline-offset-4 hover:underline">
          Scan another garment
        </Link>
      </div>

      <Sheet open={recordOpen} onOpenChange={setRecordOpen} title={`Batch ${batch.id}`} description="Sensor trace of COD during treatment. The dashed line is the 200 mg/L standard.">
        <TraceChart trace={batch.trace} />
        <p className="mt-3 text-base text-body">Dashed line: 200 mg/L standard. Sensor hash {batch.sensorHash}.</p>
        <p className="mt-4">
          <Link href={`/dashboard/batches/${batch.id}`} className="font-semibold text-teal underline-offset-4 hover:underline">
            Open the company batch record
          </Link>
        </p>
      </Sheet>

      <Sheet open={meaningOpen} onOpenChange={setMeaningOpen} title="What this seal means" description="ClearThread is an independent clean-water record for this garment.">
        <p>
          A verified seal means the dye water for the linked batch met the published standard, an independent auditor signed the file, and the volume can be billed. It is not a government mark.
        </p>
        <p className="mt-3">
          <Link href="/standard" className="font-semibold text-teal underline-offset-4 hover:underline">
            Read the standard
          </Link>
        </p>
      </Sheet>

      <Sheet open={concernOpen} onOpenChange={setConcernOpen} title="Report a concern" description="This note stays on this device. It is not sent to a server.">
        {saved ? (
          <p className="text-base text-ink">Saved on this device. Thank you for the note.</p>
        ) : (
          <ConcernForm
            garmentId={garment.id}
            onSubmit={(input) => {
              addConcern(input);
              setSaved(true);
            }}
          />
        )}
      </Sheet>
    </article>
  );
}

function Proof({ ok, pending, title, body }: { ok: boolean; pending: boolean; title: string; body: string }) {
  const Icon = pending ? Clock : ok ? Check : AlertTriangle;
  const tone = pending ? "text-ink" : ok ? "text-teal" : "text-dye";
  return (
    <li className="flex gap-3 rounded-2xl border border-line bg-white p-4">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone}`} aria-hidden="true" />
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-base text-body">{body}</p>
      </div>
    </li>
  );
}

function CodBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "water" | "teal" | "dye" }) {
  const width = `${Math.max(6, (value / max) * 100)}%`;
  const color = tone === "water" ? "bg-water" : tone === "dye" ? "bg-dye" : "bg-teal";
  return (
    <div>
      <div className="mb-1 flex justify-between text-base">
        <span className="text-ink">{label}</span>
        <span className="tabular-nums font-semibold text-ink">{formatNumber(value)} mg/L</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-mist">
        <motion.div className={`h-full origin-left rounded-full ${color}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ width }} transition={{ duration: 0.8 }} />
      </div>
    </div>
  );
}

function FillingDrop() {
  const clipId = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 80 110" className="h-24 w-16 shrink-0" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d="M40 8C40 8 12 42 12 64a28 28 0 0 0 56 0C68 42 40 8 40 8Z" />
        </clipPath>
      </defs>
      <path d="M40 8C40 8 12 42 12 64a28 28 0 0 0 56 0C68 42 40 8 40 8Z" fill="#E8F0EC" stroke="#1F5FA8" strokeWidth="3" />
      <g clipPath={`url(#${clipId})`}>
        <motion.rect x="0" width="80" height="70" fill="#4A9BE8" initial={{ y: 110 }} animate={{ y: 48 }} transition={{ duration: 1.1, ease: "easeOut" }} />
      </g>
    </svg>
  );
}

function ConcernForm({
  garmentId,
  onSubmit,
}: {
  garmentId: string;
  onSubmit: (input: { garmentId: string; message: string; contact: string }) => void;
}) {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ garmentId, message, contact });
      }}
    >
      <label className="block text-base font-semibold text-ink" htmlFor="concern-message">
        What should we look at?
        <textarea
          id="concern-message"
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-2 min-h-28 w-full rounded-xl border border-line bg-paper p-3 text-base font-normal text-ink"
        />
      </label>
      <label className="block text-base font-semibold text-ink" htmlFor="concern-contact">
        Contact (optional)
        <input
          id="concern-contact"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-line bg-paper px-3 text-base font-normal text-ink"
        />
      </label>
      <Button type="submit" className="w-full">
        Save on this device
      </Button>
    </form>
  );
}
