import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError } from '@/lib/utils/errorHandler'
import { normalizeRole } from '@/lib/constants/crewRoles'

// Cache roles in memory — they rarely change
let cachedRoles: string[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

async function getAllRoles(): Promise<string[]> {
  if (cachedRoles && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedRoles
  }

  const supabase = createClient()
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('primary_role, secondary_roles')
    .eq('profile_status', 'approved')

  if (error) {
    throw new Error(`Failed to fetch roles: ${error.message}`)
  }

  const roleSet = new Set<string>()
  profiles?.forEach((profile) => {
    if (profile.primary_role) {
      roleSet.add(normalizeRole(profile.primary_role))
    }
    if (profile.secondary_roles && Array.isArray(profile.secondary_roles)) {
      profile.secondary_roles.forEach((role: string) => {
        if (role) roleSet.add(normalizeRole(role))
      })
    }
  })

  cachedRoles = Array.from(roleSet).sort()
  cacheTimestamp = Date.now()
  return cachedRoles
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    let roles = await getAllRoles()

    if (query) {
      const lowerQuery = query.toLowerCase()
      roles = roles.filter((role) =>
        role.toLowerCase().includes(lowerQuery)
      )
    }

    roles = roles.slice(0, 50)

    return NextResponse.json(
      { roles },
      { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } }
    )
  } catch (error) {
    return handleError(error)
  }
}

