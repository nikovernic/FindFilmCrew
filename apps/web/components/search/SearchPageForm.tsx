'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { RoleSearchInput } from './RoleSearchInput'
import { CitySearchInput } from './CitySearchInput'
import { StateSearchInput } from './StateSearchInput'

export function SearchPageForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize from URL params, default state to TX
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [role, setRole] = useState(searchParams.get('role') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [state, setState] = useState(searchParams.get('state') || 'TX')

  // Update state when URL params change (e.g., from navigation)
  useEffect(() => {
    setQ(searchParams.get('q') || '')
    setRole(searchParams.get('role') || '')
    setCity(searchParams.get('city') || '')
    setState(searchParams.get('state') || 'TX')
  }, [searchParams])

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    // Preserve other params like page, years_experience, etc.
    searchParams.forEach((value, key) => {
      if (!['q', 'role', 'city', 'state', 'page'].includes(key)) {
        params.set(key, value)
      }
    })

    if (q.trim()) {
      params.set('q', q.trim())
    } else {
      params.delete('q')
    }

    if (role) {
      params.set('role', role)
    } else {
      params.delete('role')
    }
    
    // Always include state (defaults to TX)
    params.set('state', state || 'TX')
    
    // City is optional
    if (city) {
      params.set('city', city)
    } else {
      params.delete('city')
    }

    // Reset to page 1 when filters change
    params.delete('page')

    // Navigate to search page with filters
    router.push(`/search?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-3 p-2 bg-background border rounded">
        <div className="flex-1">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by name or keyword"
            className="w-full px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        <div className="flex-1">
          <RoleSearchInput
            value={role}
            placeholder="Role (e.g., Gaffer, DP, AC)"
            onRoleChange={setRole}
          />
        </div>
        <div className="flex-1">
          <CitySearchInput
            value={city}
            placeholder="City (optional)"
            state={state}
            onCityChange={setCity}
          />
        </div>
        <div className="w-24 sm:w-32">
          <StateSearchInput
            value={state}
            placeholder="State"
            onStateChange={setState}
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          onKeyDown={handleKeyDown}
          className="px-6 py-2.5 bg-foreground text-background rounded hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2"
        >
          <Search className="h-5 w-5" />
          Search
        </button>
      </div>
    </div>
  )
}

