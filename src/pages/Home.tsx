import { Link } from 'react-router-dom';
import { Seal } from '../components/Seal';
import { BATCHES } from '../data/batches';
import { passportPath } from '../lib/links';
import { reusePercent } from '../lib/status';

const SAMPLE_BATCH_ID = 'CT-DEMO-0001';
const SAMPLE_BATCH = BATCHES.find((batch) => batch.id === SAMPLE_BATCH_ID);

const STEPS = [
  {
    title: 'Treat',
    body: 'The dye house treats its wastewater and records the method, the date and the volume.',
  },
  {
    title: 'Verify',
    body: 'An independent lab measures named pollutants before and after treatment, and the report is dated.',
  },
  {
    title: 'Scan',
    body: 'The QR code on the garment tag opens that batch’s passport on your phone, with the full record.',
  },
] as const;

const PROMISES = [
  'Shows only what each batch record says was measured.',
  'Shows failed results too. A failed result withholds the seal.',
  'Names the mill, the lab and the report date for every batch.',
] as const;

export function Home() {
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <p className="text-sm font-bold uppercase tracking-wider text-accent-text">Water passport for textiles</p>
          <h1 className="text-4xl leading-tight sm:text-5xl">See how the water behind your clothes was cleaned.</h1>
          <p className="max-w-lg text-lg text-muted">
            ClearThread puts a passport on every garment batch: the mill, the treatment, the lab result and how much
            water was reused.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={passportPath(SAMPLE_BATCH_ID)}
              className="inline-flex min-h-[48px] items-center rounded-md bg-indigo px-6 py-3 text-base font-bold text-linen no-underline hover:bg-ink"
            >
              Try a sample garment
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex min-h-[48px] items-center rounded-md border-2 border-indigo px-6 py-3 text-base font-bold text-indigo no-underline hover:bg-indigo hover:text-linen"
            >
              For brands
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-sm rounded-2xl border border-indigo/20 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Seal size="md" label="ClearThread demo seal" />
              <div>
                <p className="text-sm text-muted">Sample passport</p>
                <p className="font-heading text-xl text-indigo">{SAMPLE_BATCH?.garment}</p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-base">
              <dt className="text-muted">Mill</dt>
              <dd className="font-bold">{SAMPLE_BATCH?.mill}</dd>
              <dt className="text-muted">Water treated</dt>
              <dd className="font-bold">{SAMPLE_BATCH?.litersTreated.toLocaleString('en-GB')} L</dd>
              <dt className="text-muted">Water reused</dt>
              <dd className="font-bold">{SAMPLE_BATCH ? `${reusePercent(SAMPLE_BATCH)}%` : ''}</dd>
            </dl>
            <p className="mt-6 text-sm text-muted">Demo data. Not real test results.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="space-y-6">
        <h2 id="how-heading" className="text-3xl">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-ink/15 bg-white/70 p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-accent-text">Step {index + 1}</p>
              <h3 className="mt-1 text-xl">{step.title}</h3>
              <p className="mt-2 text-base text-ink">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="promise-heading" className="rounded-2xl bg-indigo p-8 text-linen">
        <h2 id="promise-heading" className="text-3xl text-linen">Our promises</h2>
        <ul className="mt-4 list-disc space-y-3 pl-6 text-lg">
          {PROMISES.map((promise) => (
            <li key={promise}>{promise}</li>
          ))}
        </ul>
        <p className="mt-6 text-base">
          <Link to="/standards" className="font-bold text-turquoise-dark">
            Read the seal criteria
          </Link>
        </p>
      </section>
    </div>
  );
}
