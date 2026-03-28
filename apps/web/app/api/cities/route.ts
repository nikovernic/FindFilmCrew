import { NextRequest, NextResponse } from 'next/server'
import { handleError } from '@/lib/utils/errorHandler'
import texasCities from '@/lib/data/texas-cities.json'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const state = searchParams.get('state') || ''

    // For now, we only support Texas
    if (state && state.toUpperCase() !== 'TX') {
      return NextResponse.json({ cities: [] })
    }

    let cities = texasCities as string[]

    // Filter by query if provided
    if (query) {
      const lowerQuery = query.toLowerCase()
      cities = cities.filter((city) =>
        city.toLowerCase().includes(lowerQuery)
      )
    }

    // Sort and limit results
    cities = cities.sort().slice(0, 50)

    return NextResponse.json(
      { cities },
      { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } }
    )
  } catch (error) {
    return handleError(error)
  }
}

