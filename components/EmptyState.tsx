export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <h2 className="font-display text-2xl font-extrabold text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-base text-body">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`motion-safe:animate-pulse rounded-2xl bg-mist ${className ?? "h-24"}`} />;
}
