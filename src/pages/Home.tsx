import { Link } from 'react-router-dom';
import { Seal } from '../components/Seal';
import { passportPath } from '../lib/links';

const SAMPLE_BATCH_ID = 'CT-DEMO-0001';

const STEPS = [
  {
    title: 'Treat',
    body: 'The dye house treats its wastewater and records the method and date.',
  },
  {
    title: 'Verify',
    body: 'An independent lab measures pollutants before and after treatment.',
  },
  {
    title: 'Scan',
    body: 'The QR code on the garment tag opens that batch’s passport on your phone.',
  },
] as const;

export function Home() {
  return (
    <div className="space-y-12">
      <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="shrink-0">
          <Seal size="lg" label="ClearThread demo seal" />
        </div>
        <div className="space-y-5">
          <h1 className="text-3xl sm:text-4xl">See how the water behind your clothes was cleaned.</h1>
          <p className="max-w-xl text-lg text-muted">
            ClearThread is a demo passport for dye-house wastewater. Each garment tag links to the batch record:
            the mill, the treatment, the lab result and how much water was reused.
          </p>
          <Link
            to={passportPath(SAMPLE_BATCH_ID)}
            className="inline-flex min-h-[48px] items-center rounded-md bg-indigo px-6 py-3 text-base font-bold text-linen no-underline hover:bg-ink"
          >
            Try a sample garment
          </Link>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="space-y-6">
        <h2 id="how-heading" className="text-2xl">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-lg border border-ink/15 bg-white/60 p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-accent-text">Step {index + 1}</p>
              <h3 className="mt-1 text-xl">{step.title}</h3>
              <p className="mt-2 text-base text-ink">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
