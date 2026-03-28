'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { SlidersHorizontal, ChevronDown, ChevronUp, Clock, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  // Initialize state from URL params (only years of experience now)
  const [yearsMin, setYearsMin] = useState(searchParams.get('years_experience_min') || '')
  const [yearsMax, setYearsMax] = useState(searchParams.get('years_experience_max') || '')

  // Update URL when filters change
  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Preserve all existing params except years_experience and page
    params.delete('years_experience_min')
    params.delete('years_experience_max')
    params.delete('page') // Reset to page 1 when filters change

    // Add new filter params
    if (yearsMin) params.set('years_experience_min', yearsMin)
    if (yearsMax) params.set('years_experience_max', yearsMax)

    startTransition(() => {
      router.push(`/search?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setYearsMin('')
    setYearsMax('')

    const params = new URLSearchParams(searchParams.toString())
    params.delete('years_experience_min')
    params.delete('years_experience_max')
    params.delete('page')

    startTransition(() => {
      router.push(`/search?${params.toString()}`)
    })
  }

  // Check if any filters are active
  const hasActiveFilters = yearsMin || yearsMax
  const activeFilterCount = [yearsMin, yearsMax].filter(Boolean).length

  return (
    <div className="border rounded mb-6 overflow-hidden bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
        aria-expanded={isOpen}
        aria-controls="filters-content"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">
              {activeFilterCount}
            </span>
          )}
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      <div
        id="filters-content"
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-5 border-t space-y-5">
          {/* Years of Experience Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Years in Industry
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-years-min" className="sr-only">Minimum years</label>
                <input
                  id="filter-years-min"
                  type="number"
                  value={yearsMin}
                  onChange={(e) => setYearsMin(e.target.value)}
                  onBlur={updateFilters}
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
                  placeholder="Min years"
                  min="0"
                  className="w-full px-3 py-2 border rounded text-sm"
                  disabled={isPending}
                />
              </div>
              <div>
                <label htmlFor="filter-years-max" className="sr-only">Maximum years</label>
                <input
                  id="filter-years-max"
                  type="number"
                  value={yearsMax}
                  onChange={(e) => setYearsMax(e.target.value)}
                  onBlur={updateFilters}
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
                  placeholder="Max years"
                  min="0"
                  className="w-full px-3 py-2 border rounded text-sm"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={updateFilters}
              className="flex-1 px-4 py-2 bg-foreground text-background rounded hover:opacity-90 transition-opacity font-medium disabled:opacity-50 text-sm"
              disabled={isPending}
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 border rounded hover:bg-accent transition-colors font-medium inline-flex items-center gap-2 disabled:opacity-50 text-sm"
                disabled={isPending}
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active filter chips (shown when collapsed) */}
      {!isOpen && hasActiveFilters && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {(yearsMin || yearsMax) && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted text-muted-foreground text-sm rounded">
              <Clock className="h-3.5 w-3.5" />
              {yearsMin && yearsMax ? `${yearsMin}-${yearsMax} yrs` : yearsMin ? `${yearsMin}+ yrs` : `0-${yearsMax} yrs`}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
