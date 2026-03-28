import { NextRequest, NextResponse } from 'next/server'
import { profileService } from '@/lib/services/profileService'
import { buildSearchQuery } from '@/lib/services/searchService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const params = {
      q: searchParams.get('q') || undefined,
      role: searchParams.get('role') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      years_experience_min: searchParams.get('years_experience_min')
        ? parseInt(searchParams.get('years_experience_min')!, 10)
        : undefined,
      years_experience_max: searchParams.get('years_experience_max')
        ? parseInt(searchParams.get('years_experience_max')!, 10)
        : undefined,
      page: searchParams.get('page')
        ? parseInt(searchParams.get('page')!, 10)
        : 1,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!, 10)
        : 20,
    }

    const searchQuery = buildSearchQuery(params)

    const { profiles, total } = await profileService.searchProfiles(
      searchQuery.textQuery,
      searchQuery.filters,
      searchQuery.pagination.page,
      searchQuery.pagination.limit
    )

    return NextResponse.json(
      {
        profiles,
        total,
        page: searchQuery.pagination.page,
        limit: searchQuery.pagination.limit,
        hasMore: searchQuery.pagination.page * searchQuery.pagination.limit < total,
      },
      { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' } }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search profiles' },
      { status: 500 }
    )
  }
}
