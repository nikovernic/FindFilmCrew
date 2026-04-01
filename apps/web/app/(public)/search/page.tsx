import { profileService } from '@/lib/services/profileService'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { SearchPageForm } from '@/components/search/SearchPageForm'

import { EmptyState } from '@/components/ui/EmptyState'
import { buildSearchQuery } from '@/lib/services/searchService'
import type { Metadata } from 'next'
import { getAbsoluteUrl } from '@/lib/utils/url'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getSearchResults(searchParams: SearchPageProps['searchParams']) {
  const params = {
    q: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    role: typeof searchParams.role === 'string' ? searchParams.role : undefined,
    city: typeof searchParams.city === 'string' ? searchParams.city : undefined,
    state: typeof searchParams.state === 'string' ? searchParams.state : undefined,
    years_experience_min:
      typeof searchParams.years_experience_min === 'string'
        ? parseInt(searchParams.years_experience_min, 10)
        : undefined,
    years_experience_max:
      typeof searchParams.years_experience_max === 'string'
        ? parseInt(searchParams.years_experience_max, 10)
        : undefined,
    page:
      typeof searchParams.page === 'string'
        ? parseInt(searchParams.page, 10)
        : undefined,
    limit:
      typeof searchParams.limit === 'string'
        ? parseInt(searchParams.limit, 10)
        : undefined,
  }

  const searchQuery = buildSearchQuery(params)

  const { profiles, total } = await profileService.searchProfiles(
    searchQuery.textQuery,
    searchQuery.filters,
    searchQuery.pagination.page,
    searchQuery.pagination.limit
  )

  return {
    profiles,
    total,
    pagination: {
      page: searchQuery.pagination.page,
      limit: searchQuery.pagination.limit,
      totalPages: Math.ceil(total / searchQuery.pagination.limit),
    },
    query: searchQuery.textQuery || '',
  }
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = typeof searchParams.q === 'string' ? searchParams.q : ''
  const role = typeof searchParams.role === 'string' ? searchParams.role : ''
  const city = typeof searchParams.city === 'string' ? searchParams.city : ''

  let title: string
  let description: string

  if (role && city) {
    title = `${role} in ${city}, Texas`
    description = `Find ${role.toLowerCase()} crew members in ${city}, Texas. Browse profiles, credits, and contact info.`
  } else if (role) {
    title = `${role} in Texas`
    description = `Find ${role.toLowerCase()} crew members in Texas. Browse profiles, credits, and contact info across Austin, Dallas, Houston, and more.`
  } else if (query) {
    title = `Search Results for '${query}' in Texas`
    description = `Find Texas film crew matching '${query}'. Camera operators, DPs, gaffers, grips, and more.`
  } else {
    title = 'Search Texas Film Crew'
    description = 'Search 1,200+ Texas film crew members. Find camera operators, DPs, gaffers, grips, sound mixers, and more.'
  }

  const searchUrl = getAbsoluteUrl('/search')
  const urlWithQuery = query
    ? `${searchUrl}?q=${encodeURIComponent(query)}`
    : role
      ? `${searchUrl}?role=${encodeURIComponent(role)}`
      : searchUrl

  return {
    title,
    description,
    alternates: {
      canonical: urlWithQuery,
    },
    openGraph: {
      title,
      description,
      url: urlWithQuery,
      siteName: 'Find Film Crew Texas',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

function PaginationControls({
  currentPage,
  totalPages,
  query,
  filters,
}: {
  currentPage: number
  totalPages: number
  query?: string
  filters?: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null

  const buildUrl = (page: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (filters?.role) params.set('role', filters.role)
    if (filters?.city) params.set('city', filters.city)
    if (filters?.state) params.set('state', filters.state)
    if (filters?.years_experience_min)
      params.set('years_experience_min', filters.years_experience_min)
    if (filters?.years_experience_max)
      params.set('years_experience_max', filters.years_experience_max)
    params.set('page', page.toString())
    return `/search?${params.toString()}`
  }

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-12"
      aria-label="Pagination"
    >
      <Link
        href={currentPage > 1 ? buildUrl(currentPage - 1) : '#'}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
          currentPage > 1
            ? 'hover:bg-accent text-foreground'
            : 'text-muted-foreground/50 pointer-events-none'
        }`}
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Link>

      <div className="flex items-center gap-1 mx-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <Link
                key={page}
                href={buildUrl(page)}
                className={`min-w-[32px] h-8 flex items-center justify-center rounded text-sm transition-colors ${
                  page === currentPage
                    ? 'bg-foreground text-background'
                    : 'hover:bg-accent'
                }`}
              >
                {page}
              </Link>
            )
          } else if (
            page === currentPage - 2 ||
            page === currentPage + 2
          ) {
            return (
              <span key={page} className="px-2 text-muted-foreground">
                ...
              </span>
            )
          }
          return null
        })}
      </div>

      <Link
        href={currentPage < totalPages ? buildUrl(currentPage + 1) : '#'}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
          currentPage < totalPages
            ? 'hover:bg-accent text-foreground'
            : 'text-muted-foreground/50 pointer-events-none'
        }`}
        aria-disabled={currentPage >= totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { profiles, total, pagination, query } = await getSearchResults(
    searchParams
  )

  const filters = {
    role:
      typeof searchParams.role === 'string' ? searchParams.role : undefined,
    city:
      typeof searchParams.city === 'string' ? searchParams.city : undefined,
    state:
      typeof searchParams.state === 'string' ? searchParams.state : undefined,
    years_experience_min:
      typeof searchParams.years_experience_min === 'string'
        ? searchParams.years_experience_min
        : undefined,
    years_experience_max:
      typeof searchParams.years_experience_max === 'string'
        ? searchParams.years_experience_max
        : undefined,
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            {query ? `Results for "${query}"` : 'Search Crew'}
          </h1>
          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              Found <span className="font-medium text-foreground">{total}</span>{' '}
              {total === 1 ? 'crew member' : 'crew members'}
            </p>
          )}
        </div>

        {/* Search Form */}
        <SearchPageForm />

        {/* Results */}
        {profiles.length === 0 ? (
          <EmptyState
            variant="search"
            title="No crew members found"
            description={
              query
                ? `We couldn't find any crew members matching "${query}". Try adjusting your search or filters.`
                : 'Try searching for a role, location, or crew member name.'
            }
            action={{
              label: 'Clear filters',
              href: '/search',
            }}
          />
        ) : (
          <>
            <section className="divide-y-0">
              {profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </section>

            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              query={query}
              filters={filters}
            />
          </>
        )}
      </div>
    </div>
  )
}
