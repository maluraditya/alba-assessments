import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="min-h-screen bg-[#f4f4f0] px-4 py-8 lg:pl-[276px] lg:pr-8"><div className="mx-auto max-w-[1540px]" aria-label="Loading workspace" aria-busy="true"><Skeleton className="h-3 w-28" /><Skeleton className="mt-4 h-10 w-72" /><Skeleton className="mt-3 h-4 w-full max-w-xl" /><section className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)}</section><section className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]"><Skeleton className="h-[360px] rounded-2xl" /><Skeleton className="h-[360px] rounded-2xl" /></section></div></main>;
}
