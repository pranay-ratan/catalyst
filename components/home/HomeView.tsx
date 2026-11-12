import Link from "next/link";
import { Seal } from "@/components/Seal";
import { Shirt } from "@/components/Shirt";
import { StatusPill } from "@/components/StatusPill";
import { PageFrame } from "@/components/PageFrame";
import { AUDITOR_NAME, BRAND_NAME, MONITOR_NAME } from "@/lib/brand";
import { HERO_GARMENT_ID } from "@/lib/ids";

const STEPS = [
  { title: "Clean", body: "A Viridis unit treats the dye bath at the mill and logs every reading." },
  { title: "Verify", body: "ClearThread checks the batch. An independent auditor signs the file." },
  { title: "Scan", body: "The garment tag opens the water story, ready for a digital product passport." },
];

export function HomeView() {
  return (
    <PageFrame>
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-16">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-base font-semibold text-teal">ClearThread</p>
            <h1 className="mt-3 max-w-xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink md:text-6xl">
              Verified clean water, on every label
            </h1>
            <p className="mt-5 max-w-xl text-lg text-body">
              An independent seal for clothing. ClearThread measures dye water cleaned at the mill, audits the result, and bills the brand only for cubic metres that passed.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Seal size="lg" status="verified" animated />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal px-5 font-semibold text-white">
                Open company dashboard
              </Link>
              <Link href="/scan" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-white px-5 font-semibold text-ink">
                Scan a garment
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <Link href={`/p/${HERO_GARMENT_ID}`} className="block w-[280px] rounded-[2.2rem] border-[10px] border-ink bg-paper p-4 shadow-card" aria-label="Open the navy cotton T-shirt passport">
              <span className="mx-auto mb-4 block h-1.5 w-16 rounded-full bg-ink/80" />
              <span className="flex flex-col items-center text-center">
                <Seal size="md" status="verified" decorative />
                <span className="mt-3">
                  <StatusPill status="verified" label="ClearThread Verified" />
                </span>
                <span className="mt-3 font-display text-xl font-extrabold text-ink">Navy cotton T-shirt</span>
                <span className="text-base text-body">{BRAND_NAME}</span>
                <Shirt color="#1B3A4B" silhouette="tee" title="Navy cotton T-shirt" />
                <span className="font-display text-3xl font-extrabold text-ink">31 L</span>
                <span className="text-base text-body">cleaned and reused for this shirt</span>
              </span>
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <article key={step.title} className="rise rounded-2xl border border-line bg-white p-6 shadow-card" style={{ animationDelay: `${index * 80}ms` }}>
              <p className="font-display text-base font-extrabold text-teal">Step {index + 1}</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-ink">{step.title}</h2>
              <p className="mt-3 text-base text-body">{step.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-2xl bg-ink px-6 py-8 text-white md:px-10">
          <h2 className="font-display text-3xl font-extrabold text-white">Why it matters</h2>
          <p className="mt-3 max-w-3xl text-base text-white/90">
            Dye wastewater can carry colour and chemical load out of a mill. Brands are being asked to show what happened to that water. ClearThread keeps the measurement, the audit, and the bill on the same batch, then puts that record on the garment.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-3xl font-extrabold text-ink">How it&apos;s independent</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-line bg-white p-6">
              <h3 className="font-display text-xl font-extrabold">Measured</h3>
              <p className="mt-2 text-base text-body">Sensors on the Viridis unit are logged by ClearThread. The mill does not award the seal.</p>
            </article>
            <article className="rounded-2xl border border-line bg-white p-6">
              <h3 className="font-display text-xl font-extrabold">Audited</h3>
              <p className="mt-2 text-base text-body">{AUDITOR_NAME} signs the file. The auditor does not work for the brand or the mill.</p>
            </article>
            <article className="rounded-2xl border border-line bg-white p-6">
              <h3 className="font-display text-xl font-extrabold">Watched downstream</h3>
              <p className="mt-2 text-base text-body">{MONITOR_NAME} test the water below the mill at least once a month.</p>
            </article>
          </div>
          <p className="mt-6 text-base text-body">
            Viridis runs the equipment. ClearThread decides the seal. The brand pays per verified cubic metre.{" "}
            <Link href="/standard" className="inline-flex min-h-11 items-center font-semibold text-teal underline-offset-4 hover:underline">
              Read the standard
            </Link>
            .
          </p>
        </section>
      </div>
    </PageFrame>
  );
}
