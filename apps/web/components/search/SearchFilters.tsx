'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { SlidersHorizontal, ChevronDown, ChevronUp, Briefcase, MapPin, Clock, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  // Initialize state from URL params
  const [role, setRole] = useState(searchParams.get('role') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [state, setState] = useState(searchParams.get('state') || '')
  const [yearsMin, setYearsMin] = useState(searchParams.get('years_experience_min') || '')
  const [yearsMax, setYearsMax] = useState(searchParams.get('years_experience_max') || '')

  // Update URL when filters change
  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Preserve search query
    const query = searchParams.get('q') || ''

    // Clear existing filter params
    params.delete('role')
    params.delete('city')
    params.delete('state')
    params.delete('years_experience_min')
    params.delete('years_experience_max')
    params.delete('page') // Reset to page 1 when filters change

    // Add new filter params
    if (role) params.set('role', role)
    if (city) params.set('city', city)
    if (state) params.set('state', state)
    if (yearsMin) params.set('years_experience_min', yearsMin)
    if (yearsMax) params.set('years_experience_max', yearsMax)

    // Preserve query if it exists
    if (query) params.set('q', query)

    startTransition(() => {
      router.push(`/search?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setRole('')
    setCity('')
    setState('')
    setYearsMin('')
    setYearsMax('')

    const params = new URLSearchParams()
    const query = searchParams.get('q')
    if (query) params.set('q', query)

    startTransition(() => {
      router.push(query ? `/search?${params.toString()}` : '/search')
    })
  }

  // Check if any filters are active
  const hasActiveFilters = role || city || state || yearsMin || yearsMax
  const activeFilterCount = [role, city, state, yearsMin, yearsMax].filter(Boolean).length

  return (
    <div className="border rounded-xl mb-6 overflow-hidden bg-card">
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
            <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
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
          {/* Role Filter */}
          <div>
            <label htmlFor="filter-role" className="flex items-center gap-2 text-sm font-medium mb-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Role
            </label>
            <input
              id="filter-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onBlur={updateFilters}
              onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
              placeholder="e.g., Gaffer, DP, AC"
              className="w-full px-4 py-2.5 border rounded-lg"
              disabled={isPending}
            />
          </div>

          {/* Location Filters */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Location
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="filter-city" className="sr-only">City</label>
                <input
                  id="filter-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={updateFilters}
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
                  placeholder="City (e.g., Nashville)"
                  className="w-full px-4 py-2.5 border rounded-lg"
                  disabled={isPending}
                />
              </div>
              <div>
                <label htmlFor="filter-state" className="sr-only">State</label>
                <input
                  id="filter-state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  onBlur={updateFilters}
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
                  placeholder="State (e.g., TN)"
                  maxLength={2}
                  className="w-full px-4 py-2.5 border rounded-lg uppercase"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

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
                  className="w-full px-4 py-2.5 border rounded-lg"
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
                  className="w-full px-4 py-2.5 border rounded-lg"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={updateFilters}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium btn-press disabled:opacity-50"
              disabled={isPending}
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 border rounded-lg hover:bg-accent transition-colors font-medium inline-flex items-center gap-2 btn-press disabled:opacity-50"
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
          {role && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              <Briefcase className="h-3.5 w-3.5" />
              {role}
            </span>
          )}
          {(city || state) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              <MapPin className="h-3.5 w-3.5" />
              {[city, state].filter(Boolean).join(', ')}
            </span>
          )}
          {(yearsMin || yearsMax) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              <Clock className="h-3.5 w-3.5" />
              {yearsMin && yearsMax ? `${yearsMin}-${yearsMax} yrs` : yearsMin ? `${yearsMin}+ yrs` : `0-${yearsMax} yrs`}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
