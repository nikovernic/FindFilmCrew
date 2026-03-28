import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError } from '@/lib/utils/errorHandler'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    // Get distinct states from primary_location_state and additional_markets
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('primary_location_state, additional_markets')
      .eq('profile_status', 'approved')

    if (error) {
      throw new Error(`Failed to fetch states: ${error.message}`)
    }

    // Extract all unique states
    const stateSet = new Set<string>()
    
    profiles?.forEach((profile) => {
      if (profile.primary_location_state) {
        stateSet.add(profile.primary_location_state.toUpperCase())
      }
      
      if (profile.additional_markets && Array.isArray(profile.additional_markets)) {
        profile.additional_markets.forEach((market: { city?: string; state?: string }) => {
          if (market.state) {
            stateSet.add(market.state.toUpperCase())
          }
        })
      }
    })

    let states = Array.from(stateSet).sort()

    // Filter by query if provided
    if (query) {
      const upperQuery = query.toUpperCase()
      states = states.filter((state) => state.includes(upperQuery))
    }

    // Limit results
    states = states.slice(0, 50)

    return NextResponse.json({ states })
  } catch (error) {
    return handleError(error)
  }
}

