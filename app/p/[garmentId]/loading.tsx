import { SkeletonBlock } from "@/components/EmptyState";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-10">
      <SkeletonBlock className="h-56 w-56 rounded-full" />
      <SkeletonBlock className="mt-6 h-8 w-48" />
      <SkeletonBlock className="mt-6 h-40 w-full" />
    </div>
  );
}
