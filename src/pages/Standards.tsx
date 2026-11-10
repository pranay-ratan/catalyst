const CRITERIA = [
  'Each batch is tied to one named mill and one country.',
  'The wastewater treatment method and the treatment date are recorded.',
  'Pollutants are measured by an independent lab, before and after treatment, and the report is named and dated.',
  'The post-treatment value must be at or below the reference limit recorded for that pollutant.',
  'Water reuse is reported in liters and as a percentage of the liters treated.',
  'If any record is missing or late, the batch is shown as Under review, not verified.',
  'If a lab result is above its reference limit, the seal is withheld and the failing value is published on the passport.',
] as const;

const REVOCATION_STEPS = [
  'A later audit finds a record that does not match the lab report, or a report that cannot be verified.',
  'The batch status changes to Seal withheld, and the passport explains why.',
  'The brand is told in writing and given a fixed period to answer.',
  'If the answer does not resolve the issue, the seal stays withheld and the decision is noted on the passport.',
] as const;

export function Standards() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl">Seal criteria</h1>
        <p className="text-lg text-muted">
          These are the demo criteria a batch must meet before ClearThread would show its seal. They describe what each
          batch record states. They do not claim that any particular chemical is removed.
        </p>
      </header>

      <section aria-labelledby="criteria-heading" className="space-y-4">
        <h2 id="criteria-heading" className="text-2xl">The criteria</h2>
        <ol className="list-decimal space-y-3 pl-6 text-base">
          {CRITERIA.map((criterion) => (
            <li key={criterion}>{criterion}</li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="governance-heading" className="space-y-3 rounded-lg border border-ink/15 bg-white/60 p-5">
        <h2 id="governance-heading" className="text-2xl">Governance</h2>
        <p className="text-base">Independent standards board, members to be confirmed.</p>
        <p className="text-base text-muted">
          No real organisation has reviewed, endorsed or approved this demo.
        </p>
      </section>

      <section aria-labelledby="revocation-heading" className="space-y-4">
        <h2 id="revocation-heading" className="text-2xl">How a seal is revoked</h2>
        <ol className="list-decimal space-y-3 pl-6 text-base">
          {REVOCATION_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
