import { Skeleton } from "@/components/ui/skeleton";

export default function CompetitionsLoading() {
  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="space-y-12">
        {[...Array(1)].map((_, i) => (
          <div key={i} className="space-y-6">
            <div className="flex items-baseline justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-[260px] w-full rounded-lg" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
