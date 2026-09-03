import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div className="container-page py-8 lg:py-10" aria-busy="true" aria-label="Cargando resultados">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="mt-2 h-5 w-40" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[15rem_1fr]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="overflow-hidden rounded-2xl ring-1 ring-border/70">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
