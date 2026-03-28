'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useDebounce } from '@/lib/utils/useDebounce'

interface CitySearchInputProps {
  value?: string
  placeholder?: string
  className?: string
  state?: string
  onCityChange?: (city: string) => void
}

export function CitySearchInput({
  value = '',
  placeholder = 'Search by city',
  className,
  state = 'TX',
  onCityChange,
}: CitySearchInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(inputValue, 300)

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (query: string, stateCode: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/cities?q=${encodeURIComponent(query)}&state=${encodeURIComponent(stateCode)}`
      )
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.cities || [])
      }
    } catch (error) {
      console.error('Failed to fetch city suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch suggestions when debounced query or state changes
  useEffect(() => {
    if (debouncedQuery && state) {
      fetchSuggestions(debouncedQuery, state)
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery, state, fetchSuggestions])

  // Sync external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

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

  const handleSelect = (city: string) => {
    setInputValue(city)
    setIsOpen(false)
    setSelectedIndex(-1)
    
    if (onCityChange) {
      onCityChange(city)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex])
        } else if (inputValue.trim()) {
          handleSelect(inputValue.trim())
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  const handleClear = () => {
    setInputValue('')
    setIsOpen(false)
    setSelectedIndex(-1)
    if (onCityChange) {
      onCityChange('')
    }
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-2.5 rounded border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded z-50 overflow-hidden max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : (
            <div className="py-2">
              {suggestions.map((city, index) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={cn(
                    'w-full text-left px-4 py-2 hover:bg-accent text-sm transition-colors',
                    selectedIndex === index && 'bg-accent'
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

