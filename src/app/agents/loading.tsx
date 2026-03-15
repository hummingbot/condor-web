import { Skeleton } from "@/components/ui/skeleton";

export default function AgentsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="divide-y divide-border/50">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="py-5 flex items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-7 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
