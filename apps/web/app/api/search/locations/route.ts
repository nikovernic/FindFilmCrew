import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError } from '@/lib/utils/errorHandler'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    // Get distinct locations from primary_location and additional_markets
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('primary_location_city, primary_location_state, additional_markets')
      .eq('profile_status', 'approved')

    if (error) {
      throw new Error(`Failed to fetch locations: ${error.message}`)
    }

    // Extract all unique locations
    const locationSet = new Set<string>()
    
    profiles?.forEach((profile) => {
      if (profile.primary_location_city && profile.primary_location_state) {
        locationSet.add(`${profile.primary_location_city}, ${profile.primary_location_state}`)
      }
      
      if (profile.additional_markets && Array.isArray(profile.additional_markets)) {
        profile.additional_markets.forEach((market: { city?: string; state?: string }) => {
          if (market.city && market.state) {
            locationSet.add(`${market.city}, ${market.state}`)
          }
        })
      }
    })

    let locations = Array.from(locationSet).sort()

    // Filter by query if provided
    if (query) {
      const lowerQuery = query.toLowerCase()
      locations = locations.filter((location) =>
        location.toLowerCase().includes(lowerQuery)
      )
    }

    // Limit results
    locations = locations.slice(0, 50)

    return NextResponse.json({ locations })
  } catch (error) {
    return handleError(error)
  }
}

