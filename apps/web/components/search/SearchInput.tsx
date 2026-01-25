'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock, TrendingUp, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// Common crew roles for suggestions
const popularRoles = [
  'Gaffer',
  'Director of Photography',
  'Camera Operator',
  'Key Grip',
  'Best Boy Electric',
  'Sound Mixer',
  'Production Assistant',
  'First AC',
  'Steadicam Operator',
  'DIT',
]

// Popular markets
const popularMarkets = [
  'Los Angeles, CA',
  'New York, NY',
  'Atlanta, GA',
  'Nashville, TN',
  'Chicago, IL',
  'Austin, TX',
  'Portland, OR',
  'New Orleans, LA',
]

interface SearchInputProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
  autoFocus?: boolean
}

export function SearchInput({
  placeholder = "Search for crew (e.g., 'gaffer in Nashville')",
  className,
  onSearch,
  autoFocus = false,
}: SearchInputProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Save to recent searches
    const updatedRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updatedRecent)
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent))

    setIsOpen(false)

    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  // Filter suggestions based on query
  const filteredRoles = query
    ? popularRoles.filter(role => role.toLowerCase().includes(query.toLowerCase()))
    : popularRoles.slice(0, 5)

  const filteredMarkets = query
    ? popularMarkets.filter(market => market.toLowerCase().includes(query.toLowerCase()))
    : []

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            autoComplete="off"
            autoFocus={autoFocus}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-lg z-50 overflow-hidden animate-scale-in">
          {/* Recent searches */}
          {recentSearches.length > 0 && !query && (
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Recent
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular roles */}
          {filteredRoles.length > 0 && (
            <div className="p-3 border-b">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3.5 w-3.5" />
                {query ? 'Matching Roles' : 'Popular Roles'}
              </span>
              <div className="flex flex-wrap gap-2">
                {filteredRoles.map((role, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(role)}
                    className="px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Markets */}
          {filteredMarkets.length > 0 && (
            <div className="p-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                Markets
              </span>
              <div className="space-y-1">
                {filteredMarkets.map((market, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(market)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors"
                  >
                    {market}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search hint */}
          {query && (
            <div className="p-3 border-t bg-muted/30">
              <button
                onClick={() => handleSearch(query)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm transition-colors flex items-center gap-2"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                Search for &ldquo;<span className="font-medium">{query}</span>&rdquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
