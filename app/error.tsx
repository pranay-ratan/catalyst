"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="font-display text-4xl font-extrabold text-ink">Something went wrong</h1>
      <p className="mt-3 text-base text-body">The page could not finish loading. You can try again.</p>
      <button type="button" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-teal px-4 font-semibold text-white" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
