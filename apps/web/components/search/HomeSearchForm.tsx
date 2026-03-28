'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { RoleSearchInput } from './RoleSearchInput'
import { CitySearchInput } from './CitySearchInput'
import { StateSearchInput } from './StateSearchInput'

export function HomeSearchForm() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('TX')

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (q.trim()) {
      params.set('q', q.trim())
    }

    if (role) {
      params.set('role', role)
    }

    // Always include state (defaults to TX)
    params.set('state', state || 'TX')

    // City is optional
    if (city) {
      params.set('city', city)
    }

    // Navigate to search page with filters
    if (params.toString()) {
      router.push(`/search?${params.toString()}`)
    } else {
      router.push('/search')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="max-w-5xl mx-auto mb-6">
      <div className="flex flex-col gap-3 p-3 bg-background border rounded">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Name or keyword (optional)"
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
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <CitySearchInput
              value={city}
              placeholder="City (optional)"
              state={state}
              onCityChange={setCity}
            />
          </div>
          <div className="w-full sm:w-32">
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
    </div>
  )
}

