import { SearchResultsSkeleton } from '@/components/ui/Skeleton'
import { Skeleton } from '@/components/ui/Skeleton'
import { Search } from 'lucide-react'

export default function SearchLoading() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <Skeleton className="h-9 w-64" />
          </div>
          <Skeleton className="h-5 w-48 ml-13" />
        </div>

        {/* Filters skeleton */}
        <div className="border rounded-lg mb-6">
          <div className="px-4 py-3 flex items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-5" />
          </div>
        </div>

        {/* Results skeleton */}
        <SearchResultsSkeleton count={6} />
      </div>
    </div>
  )
}
