import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="font-display text-4xl font-extrabold text-ink">Page not found</h1>
      <p className="mt-3 text-base text-body">That address is not part of this demo.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal px-4 font-semibold text-white">
          Home
        </Link>
        <Link href="/scan" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-white px-4 font-semibold text-ink">
          Scan a garment
        </Link>
      </div>
    </div>
  );
}
