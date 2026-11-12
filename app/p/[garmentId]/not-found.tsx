import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-16 text-center">
      <h1 className="font-display text-4xl font-extrabold text-ink">No passport for that ID</h1>
      <p className="mt-3 text-base text-body">Check the tag and try the scanner, or type the garment ID.</p>
      <Link href="/scan" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal px-4 font-semibold text-white">
        Open the scanner
      </Link>
    </div>
  );
}
