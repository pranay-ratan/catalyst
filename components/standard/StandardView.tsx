import Link from "next/link";
import { PageFrame } from "@/components/PageFrame";
import { AUDITOR_NAME, GOVERNANCE, MONITOR_NAME } from "@/lib/brand";
import { STANDARD_RULES } from "@/lib/standards";

export function StandardView() {
  return (
    <PageFrame>
      <div className="mx-auto max-w-4xl px-5 py-10 md:px-8">
        <p className="text-base font-semibold text-teal">ClearThread</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight text-ink">The standard</h1>
        <p className="mt-4 max-w-2xl text-lg text-body">
          A batch earns a seal only when every rule below passes. Colour is never the only signal: each result is named.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {STANDARD_RULES.map((rule) => (
            <article key={rule.id} className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <h2 className="font-display text-2xl font-extrabold text-ink">{rule.title}</h2>
              <p className="mt-2 font-display text-3xl font-extrabold text-teal">{rule.rule}</p>
              <p className="mt-3 text-base text-body">{rule.detail}</p>
            </article>
          ))}
        </div>

        <section className="mt-12 space-y-8">
          <div>
            <h2 className="font-display text-3xl font-extrabold">How a seal is earned</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-base text-body">
              <li>The Viridis unit treats the batch and ClearThread stores every sensor reading.</li>
              <li>A laboratory cross-check is compared with the sensor.</li>
              <li>{AUDITOR_NAME} signs within 72 hours.</li>
              <li>All five rules pass. The seal is written onto the garment passport.</li>
            </ol>
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold">How it is audited</h2>
            <p className="mt-3 text-base text-body">
              The sensor log is hashed when treatment ends. The auditor reviews that file, the laboratory result, and the latest downstream test. A disagreement moves the batch to under review or withheld. Only verified cubic metres are billed.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold">How a seal is revoked</h2>
            <p className="mt-3 text-base text-body">
              If a later review finds the file was wrong, the seal is revoked. The passport drops the seal, states the reason in plain language, and the volume leaves the bill. {MONITOR_NAME} keep the monthly downstream check.
            </p>
          </div>
          <div className="rounded-2xl bg-mist p-6">
            <h2 className="font-display text-2xl font-extrabold">Who governs it</h2>
            <p className="mt-3 text-base text-ink">{GOVERNANCE}.</p>
            <p className="mt-3 text-base text-body">Viridis operates the units. Viridis does not sit on the board and does not award the seal.</p>
          </div>
        </section>
        <p className="mt-10">
          <Link href="/dashboard" className="font-semibold text-teal underline-offset-4 hover:underline">
            Open the company dashboard
          </Link>
        </p>
      </div>
    </PageFrame>
  );
}
