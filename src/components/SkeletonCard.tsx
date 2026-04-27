import { Skeleton } from "@/components/ui/skeleton";

export const ProviderCardSkeleton = () => (
  <div className="bg-card rounded-2xl p-6 border border-border space-y-4 animate-fade-in">
    <div className="flex items-start gap-3">
      <Skeleton className="w-14 h-14 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="w-8 h-8 rounded-full" />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-3 w-20" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-3 w-28" />
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-border">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  </div>
);

export const ServiceCardSkeleton = () => (
  <div className="bg-card rounded-2xl p-6 border border-border space-y-4 animate-fade-in">
    <Skeleton className="w-14 h-14 rounded-xl" />
    <Skeleton className="h-5 w-24" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-16" />
  </div>
);

export const HistoryCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border p-5 space-y-3 animate-fade-in">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <div className="flex items-center gap-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-3 w-10" />
    </div>
  </div>
);
