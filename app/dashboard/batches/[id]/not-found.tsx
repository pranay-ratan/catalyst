import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-display text-4xl font-extrabold text-ink">Batch not found</h1>
      <p className="mt-3 text-base text-body">That batch is not in the demo record.</p>
      <Link href="/dashboard/batches" className="mt-6 inline-flex min-h-11 items-center font-semibold text-teal underline-offset-4 hover:underline">
        Back to batches
      </Link>
    </div>
  );
}
