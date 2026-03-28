import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError } from '@/lib/utils/errorHandler'
import {
  getRolesByDepartment,
  getAllRoles,
  normalizeRole,
  CREW_ROLES_BY_DEPARTMENT,
} from '@/lib/constants/crewRoles'

/**
 * GET /api/roles
 * Fetch roles from comprehensive constants list and existing profiles
 * Query params:
 *   - department: optional, filter by department
 *   - query: optional, filter roles by search term
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const query = searchParams.get('query') || ''

    const supabase = createClient()

    // Start with comprehensive roles list from constants
    const departmentKey =
      department && department in CREW_ROLES_BY_DEPARTMENT
        ? (department as keyof typeof CREW_ROLES_BY_DEPARTMENT)
        : null

    let allRoles = departmentKey
      ? getRolesByDepartment(departmentKey)
      : getAllRoles()

    // Also fetch roles from existing profiles in database
    let rolesQuery = supabase
      .from('profiles')
      .select('primary_role')
      .not('primary_role', 'is', null)
      .eq('profile_status', 'approved')

    // Filter by department if provided
    if (department) {
      rolesQuery = rolesQuery.eq('department', department)
    }

    // Filter by search query if provided
    if (query) {
      rolesQuery = rolesQuery.ilike('primary_role', `%${query}%`)
    }

    const { data: profiles, error } = await rolesQuery

    if (error) {
      // If database query fails, still return constants roles
      console.error('Failed to fetch roles from database:', error)
    } else {
      // Extract unique roles from database
      const dbRoles = Array.from(
        new Set(
          (profiles || [])
            .map((p) => normalizeRole(p.primary_role))
            .filter((role): role is string => !!role)
        )
      )

      // Also get unique secondary roles from all profiles
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('secondary_roles')
        .eq('profile_status', 'approved')
        .not('secondary_roles', 'is', null)

      const secondaryRolesSet = new Set<string>()
      if (allProfiles) {
        allProfiles.forEach((profile) => {
          if (profile.secondary_roles && Array.isArray(profile.secondary_roles)) {
            profile.secondary_roles.forEach((role: string) => {
              if (role) {
                secondaryRolesSet.add(normalizeRole(role))
              }
            })
          }
        })
      }

      // Normalize constants roles too
      const normalizedConstantsRoles = allRoles.map(normalizeRole)

      // Combine constants roles with database roles, remove duplicates
      allRoles = Array.from(
        new Set([...normalizedConstantsRoles, ...dbRoles, ...Array.from(secondaryRolesSet)])
      )
    }

    // Filter by query if provided
    const filteredRoles = query
      ? allRoles.filter((role) =>
          role.toLowerCase().includes(query.toLowerCase())
        )
      : allRoles

    // Sort alphabetically
    const sortedRoles = filteredRoles.sort()

    return NextResponse.json({ roles: sortedRoles }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}

