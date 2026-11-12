import { SkeletonBlock } from "@/components/EmptyState";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <SkeletonBlock className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-4">
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
      </div>
      <SkeletonBlock className="h-72" />
    </div>
  );
}
