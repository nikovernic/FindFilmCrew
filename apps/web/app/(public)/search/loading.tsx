import { SearchResultsSkeleton } from '@/components/ui/Skeleton'
import { Skeleton } from '@/components/ui/Skeleton'

export default function SearchLoading() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="border rounded mb-6">
          <div className="px-4 py-3 flex items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-5" />
          </div>
        </div>

        <SearchResultsSkeleton count={6} />
      </div>
    </div>
  )
}
