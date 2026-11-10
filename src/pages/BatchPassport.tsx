import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BATCHES } from '../data/batches';
import { Seal } from '../components/Seal';
import { ShareButton } from '../components/ShareButton';
import { passportUrl } from '../lib/links';
import { StatusBadge } from '../components/StatusBadge';
import { WarnIcon, CrossIcon } from '../components/Icons';
import { formatDate, formatNumber } from '../lib/format';
import { labResultPasses, reusePercent, sealVisibleFor, STATUS_LABEL } from '../lib/status';
import type { Batch } from '../types';

export function BatchPassport() {
  const { id = '' } = useParams();
  const batch = BATCHES.find((candidate) => candidate.id === id);

  if (!batch) {
    return (
      <section className="space-y-4">
        <h1>Batch not found</h1>
        <p>No passport exists for “{id}” in this demo.</p>
        <Link to="/dashboard">Go to the brand dashboard</Link>
      </section>
    );
  }

  return <Passport batch={batch} />;
}

function Passport({ batch }: { batch: Batch }) {
  const showSeal = sealVisibleFor(batch.status);
  const passes = labResultPasses(batch);

  return (
    <article className="mx-auto max-w-xl space-y-8">
      <header className="flex flex-col items-center gap-4 text-center">
        {showSeal ? <Seal size="md" label="ClearThread verified seal (demo)" /> : null}
        <StatusBadge status={batch.status} />
        <div className="space-y-1">
          <p className="text-base text-muted">{batch.brand}</p>
          <h1 className="text-2xl">{batch.garment}</h1>
          <p className="text-base font-bold text-ink">Batch {batch.id}</p>
        </div>
      </header>

      {batch.status === 'withheld' ? (
        <section
          aria-labelledby="withheld-heading"
          className="rounded-lg border-2 border-danger bg-danger/5 p-5"
        >
          <h2 id="withheld-heading" className="flex items-center gap-2 text-xl text-danger">
            <CrossIcon className="h-6 w-6 shrink-0" />
            Seal withheld
          </h2>
          <p className="mt-2 text-base">
            The post-treatment result for {batch.pollutant} did not meet the reference limit.
          </p>
          <p className="mt-2 text-base font-bold">
            Measured after treatment: {formatNumber(batch.afterValue)} {batch.unit}. Reference limit:{' '}
            {formatNumber(batch.afterLimit)} {batch.unit}.
          </p>
          <p className="mt-2 text-base text-muted">
            No seal is shown for this batch. The result is published here as measured.
          </p>
        </section>
      ) : null}

      {batch.status === 'review' ? (
        <section aria-labelledby="review-heading" className="rounded-lg border-2 border-warn bg-warn/5 p-5">
          <h2 id="review-heading" className="flex items-center gap-2 text-xl text-warn">
            <WarnIcon className="h-6 w-6 shrink-0" />
            Under review
          </h2>
          <p className="mt-2 text-base">
            This batch is being checked. No seal is shown until the review is complete.
          </p>
        </section>
      ) : null}

      <section aria-labelledby="timeline-heading" className="space-y-4">
        <h2 id="timeline-heading" className="text-xl">Treatment record</h2>
        <ol className="relative ml-3 space-y-6 border-l-2 border-indigo/30 pl-6">
          <TimelineStep number={1} title={`Dyed at ${batch.mill}, ${batch.country}`}>
            <p>Mill: {batch.mill}</p>
            <p>Country: {batch.country}</p>
          </TimelineStep>

          <TimelineStep number={2} title="Wastewater treated">
            <p>Method: {batch.method}</p>
            <p>Treated on: {formatDate(batch.treatedOn)}</p>
            <p>Volume treated: {formatNumber(batch.litersTreated)} L</p>
          </TimelineStep>

          <TimelineStep number={3} title="Independent lab result">
            <p>Pollutant measured: {batch.pollutant}</p>
            <p>
              Before: {formatNumber(batch.beforeValue)} {batch.unit}
            </p>
            <p>
              After: {formatNumber(batch.afterValue)} {batch.unit} (reference limit {formatNumber(batch.afterLimit)}{' '}
              {batch.unit})
            </p>
            <p className="font-bold">{passes ? 'After value is within the limit.' : 'After value is above the limit.'}</p>
            <p>Lab: {batch.lab}</p>
            <p>Report date: {formatDate(batch.reportDate)}</p>
          </TimelineStep>

          <TimelineStep number={4} title="Water reused">
            <p>
              Reused: {formatNumber(batch.litersReused)} L ({reusePercent(batch)}% of the{' '}
              {formatNumber(batch.litersTreated)} L treated)
            </p>
          </TimelineStep>
        </ol>
      </section>

      <section className="rounded-lg border border-ink/15 bg-white/60 p-5">
        <details>
          <summary className="cursor-pointer text-lg font-bold text-indigo">What this seal means</summary>
          <div className="mt-3 space-y-2 text-base">
            <p>A verified batch has all four records above, each with a dated source.</p>
            <p>The lab result compares the measured value after treatment with the demo reference limit for that pollutant.</p>
            <p>The seal says only what this batch record states was measured. It does not claim any other chemical was removed.</p>
            <p>
              Full criteria are on the <Link to="/standards">standards page</Link>. Current status: {STATUS_LABEL[batch.status]}.
            </p>
          </div>
        </details>
      </section>

      <ShareButton title={`ClearThread passport ${batch.id}`} url={passportUrl(batch.id)} />

      <p className="text-base">
        <a href={`mailto:reports@example.com?subject=${encodeURIComponent(`ClearThread problem report ${batch.id}`)}`}>
          Report a problem with this passport
        </a>
      </p>
    </article>
  );
}

interface TimelineStepProps {
  number: number;
  title: string;
  children: ReactNode;
}

function TimelineStep({ number, title, children }: TimelineStepProps) {
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className="absolute -left-[37px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo text-sm font-bold text-linen"
      >
        {number}
      </span>
      <h3 className="text-lg">{title}</h3>
      <div className="mt-1 space-y-1 text-base text-ink">{children}</div>
    </li>
  );
}
