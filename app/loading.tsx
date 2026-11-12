import { SkeletonBlock } from "@/components/EmptyState";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-5 py-10">
      <SkeletonBlock className="h-10 w-2/3" />
      <SkeletonBlock className="h-40" />
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
      </div>
    </div>
  );
}
