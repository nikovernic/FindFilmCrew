'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ProfileCard } from '@/components/profile/ProfileCard'
import type { Profile, Credit } from '@crew-up/shared'

type ProfileWithCredits = Omit<Profile, 'credits'> & { credits: Credit[] }

interface SearchResultsProps {
  initialProfiles: ProfileWithCredits[]
  total: number
  searchParams: Record<string, string | undefined>
}

const BATCH_SIZE = 50

export function SearchResults({ initialProfiles, total, searchParams }: SearchResultsProps) {
  const [profiles, setProfiles] = useState<ProfileWithCredits[]>(initialProfiles)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const loaderRef = useRef<HTMLDivElement>(null)

  const hasMore = profiles.length < total

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    const nextPage = page + 1
    const params = new URLSearchParams()
    if (searchParams.q) params.set('q', searchParams.q)
    if (searchParams.role) params.set('role', searchParams.role)
    if (searchParams.city) params.set('city', searchParams.city)
    if (searchParams.state) params.set('state', searchParams.state)
    if (searchParams.years_experience_min) params.set('years_experience_min', searchParams.years_experience_min)
    if (searchParams.years_experience_max) params.set('years_experience_max', searchParams.years_experience_max)
    params.set('page', nextPage.toString())
    params.set('limit', BATCH_SIZE.toString())

    try {
      const response = await fetch(`/api/search/profiles?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to load')
      const data = await response.json()
      setProfiles((prev) => [...prev, ...data.profiles])
      setPage(nextPage)
    } catch {
      // Silently fail — user can scroll again to retry
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, page, searchParams])

  // Reset when search params change
  useEffect(() => {
    setProfiles(initialProfiles)
    setPage(1)
  }, [initialProfiles])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = loaderRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  return (
    <>
      <section className="divide-y-0">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </section>

      {/* Scroll sentinel */}
      <div ref={loaderRef} className="py-4 text-center">
        {isLoading && (
          <span className="text-sm text-muted-foreground">Loading more...</span>
        )}
        {!hasMore && profiles.length > BATCH_SIZE && (
          <span className="text-sm text-muted-foreground">
            All {total} results shown
          </span>
        )}
      </div>
    </>
  )
}
