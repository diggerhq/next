import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return <div className="space-y-4 p-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
}
