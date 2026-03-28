import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile, Credit } from '@crew-up/shared'
import { generateSlug, ensureUniqueSlug } from '@/lib/utils/slug'
import { buildSearchQuery, type SearchFilters } from './searchService'

export interface CreateProfileData {
  name: string
  primary_role: string
  primary_location_city: string
  primary_location_state: string
  contact_email: string
  user_id?: string | null
  department?: 'camera' | 'production' | 'lighting' | 'grip' | 'art' | 'sound' | 'wardrobe' | 'hmu' | null
  contact_phone?: string | null
  bio?: string | null
  credits?: string | null
  portfolio_url?: string | null
  website?: string | null
  instagram_url?: string | null
  vimeo_url?: string | null
  imdb_url?: string | null
  photo_url?: string | null
  union_status?: 'union' | 'non-union' | 'either' | null
  years_experience?: number | null
  secondary_roles?: string[] | null
  specialties?: string[] | null
  additional_markets?: Array<{ city: string; state: string }> | null
  verification_id_url?: string | null
  profile_status?: 'pending_review' | 'approved' | 'rejected'
}

export interface UpdateProfileData extends Partial<CreateProfileData> {
  photo_url?: string | null
  slug?: string
  is_low_priority?: boolean
  is_featured?: boolean
}

export class ProfileService {
  /**
   * Get Supabase client (lazy initialization)
   */
  private get supabase() {
    return createClient()
  }

  /**
   * Check if a slug exists in the database
   */
  private async slugExists(slug: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('slug', slug)
      .single()

    // If error and it's not a "not found" error, throw it
    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return !!data
  }

  /**
   * Create a new profile with unique slug generation
   */
  async createProfile(data: CreateProfileData): Promise<Profile> {
    // Generate base slug
    const baseSlug = generateSlug(
      data.name,
      data.primary_role,
      data.primary_location_city
    )

    // Ensure slug is unique
    const uniqueSlug = await ensureUniqueSlug(baseSlug, (slug) =>
      this.slugExists(slug)
    )

    // Create profile with unique slug
    const insertData = {
      ...data,
      slug: uniqueSlug,
      is_claimed: !!data.user_id,
    }
    // Remove user_id if not set to avoid FK constraint violation
    if (!insertData.user_id) {
      delete insertData.user_id
    }
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`)
    }

    return profile as Profile
  }

  /**
   * Create a new profile with pending_review status (for Get Listed flow)
   */
  async createPendingProfile(
    data: CreateProfileData,
    verificationIdUrl?: string | null
  ): Promise<Profile> {
    // Generate base slug
    const baseSlug = generateSlug(
      data.name,
      data.primary_role,
      data.primary_location_city
    )

    // Ensure slug is unique
    const uniqueSlug = await ensureUniqueSlug(baseSlug, (slug) =>
      this.slugExists(slug)
    )

    // Create profile with pending_review status
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .insert({
        ...data,
        slug: uniqueSlug,
        is_claimed: false,
        profile_status: 'pending_review',
        is_verified: false,
        verification_id_url: verificationIdUrl || null,
        verification_requested_at: verificationIdUrl ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create pending profile: ${error.message}`)
    }

    return profile as Profile
  }

  /**
   * Get profile by slug with associated credits
   */
  async getProfileBySlug(slug: string): Promise<Profile & { credits: Credit[]; creditsText?: string | null } | null> {
    // First get the profile with the credits text field
    const { data: profileData, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Not found
        return null
      }
      throw new Error(`Failed to fetch profile: ${profileError.message}`)
    }

    // Get structured credits separately
    const { data: credits, error: creditsError } = await this.supabase
      .from('credits')
      .select('*')
      .eq('profile_id', profileData.id)
      .order('display_order', { ascending: true })

    if (creditsError) {
      throw new Error(`Failed to fetch credits: ${creditsError.message}`)
    }

    // Sort credits by display_order
    const sortedCredits = (credits || []).sort(
      (a: Credit, b: Credit) => a.display_order - b.display_order
    )

    return {
      ...profileData,
      credits: sortedCredits,
      creditsText: profileData.credits || null,
    } as Profile & { credits: Credit[]; creditsText?: string | null }
  }

  /**
   * Update an existing profile (uses regular client - respects RLS)
   */
  async updateProfile(id: string, data: UpdateProfileData): Promise<Profile> {
    // If name, role, or city changed, regenerate slug
    if (data.name || data.primary_role || data.primary_location_city) {
      // Need to fetch current profile to get all fields
      const { data: currentProfile } = await this.supabase
        .from('profiles')
        .select('name, primary_role, primary_location_city')
        .eq('id', id)
        .single()

      if (currentProfile) {
        const name = data.name || currentProfile.name
        const role = data.primary_role || currentProfile.primary_role
        const city =
          data.primary_location_city || currentProfile.primary_location_city

        const baseSlug = generateSlug(name, role, city)
        const uniqueSlug = await ensureUniqueSlug(baseSlug, (slug) =>
          this.slugExists(slug)
        )

        data = { ...data, slug: uniqueSlug }
      }
    }

    // Update the profile
    const { error: updateError } = await this.supabase
      .from('profiles')
      .update(data)
      .eq('id', id)

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    // Refetch the profile to ensure proper serialization of JSONB fields
    const updatedProfile = await this.getProfileById(id)
    if (!updatedProfile) {
      throw new Error(`Profile with id ${id} not found after update`)
    }

    return updatedProfile
  }

  /**
   * Update an existing profile as admin (bypasses RLS)
   */
  async updateProfileAsAdmin(id: string, data: UpdateProfileData): Promise<Profile> {
    // If name, role, or city changed, regenerate slug
    if (data.name || data.primary_role || data.primary_location_city) {
      // Use admin client to fetch current profile
      const adminClient = createAdminClient()
      const { data: currentProfile } = await adminClient
        .from('profiles')
        .select('name, primary_role, primary_location_city')
        .eq('id', id)
        .single()

      if (currentProfile) {
        const name = data.name || currentProfile.name
        const role = data.primary_role || currentProfile.primary_role
        const city =
          data.primary_location_city || currentProfile.primary_location_city

        const baseSlug = generateSlug(name, role, city)
        const uniqueSlug = await ensureUniqueSlug(baseSlug, (slug) =>
          this.slugExists(slug)
        )

        data = { ...data, slug: uniqueSlug }
      }
    }

    // Use admin client to update the profile (bypasses RLS)
    const adminClient = createAdminClient()
    const { error: updateError } = await adminClient
      .from('profiles')
      .update(data)
      .eq('id', id)

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    // Refetch the profile using admin client to ensure proper serialization
    const { data: updatedProfile, error: fetchError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !updatedProfile) {
      throw new Error(`Profile with id ${id} not found after update`)
    }

    return updatedProfile as Profile
  }

  /**
   * Delete a profile (cascades to credits via foreign key)
   */
  async deleteProfile(id: string): Promise<void> {
    const { error } = await this.supabase.from('profiles').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete profile: ${error.message}`)
    }
  }

  /**
   * Get profile by ID (for admin operations)
   */
  async getProfileById(id: string): Promise<Profile | null> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return profile as Profile
  }

  /**
   * Get all profiles with pending_review status
   */
  async getPendingProfiles(): Promise<Profile[]> {
    const { data: profiles, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('profile_status', 'pending_review')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch pending profiles: ${error.message}`)
    }

    return (profiles || []) as Profile[]
  }

  /**
   * Get all profiles (for admin use) with pagination and optional search
   */
  async getAllProfiles(
    page: number = 1,
    limit: number = 50,
    searchQuery?: string
  ): Promise<{ profiles: Profile[]; total: number }> {
    // Normalize pagination
    const normalizedPage = Math.max(1, Math.floor(page))
    const normalizedLimit = Math.max(1, Math.min(100, Math.floor(limit)))
    const offset = (normalizedPage - 1) * normalizedLimit

    let query = this.supabase.from('profiles').select('*', { count: 'exact' })

    // Apply search filter if provided
    if (searchQuery && searchQuery.trim()) {
      const search = `%${searchQuery.trim()}%`
      query = query.or(
        `name.ilike.${search},primary_role.ilike.${search},primary_location_city.ilike.${search},primary_location_state.ilike.${search},contact_email.ilike.${search}`
      )
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false })

    // Apply pagination
    query = query.range(offset, offset + normalizedLimit - 1)

    const { data: profiles, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch profiles: ${error.message}`)
    }

    return {
      profiles: (profiles || []) as Profile[],
      total: count || 0,
    }
  }

  /**
   * Update profile status (for admin approval/rejection)
   */
  async updateProfileStatus(
    id: string,
    status: 'pending_review' | 'approved' | 'rejected'
  ): Promise<Profile> {
    const adminClient = createAdminClient()
    const { data: profile, error } = await adminClient
      .from('profiles')
      .update({ profile_status: status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update profile status: ${error.message}`)
    }

    return profile as Profile
  }

  /**
   * Get profile by user_id (for crew member operations)
   */
  async getProfileByUserId(userId: string): Promise<Profile & { credits: Credit[] } | null> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select(
        `
        *,
        credits (
          id,
          project_title,
          role,
          project_type,
          year,
          production_company,
          director,
          display_order,
          created_at,
          updated_at
        )
      `
      )
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    // Sort credits by display_order
    const sortedCredits = (profile.credits || []).sort(
      (a: Credit, b: Credit) => a.display_order - b.display_order
    )

    return {
      ...profile,
      credits: sortedCredits,
    } as Profile & { credits: Credit[] }
  }

  /**
   * Update profile for authenticated user (ensures user can only update their own profile)
   */
  async updateProfileForUser(userId: string, data: UpdateProfileData): Promise<Profile> {
    // Get profile by user_id to ensure it exists and belongs to user
    const profile = await this.getProfileByUserId(userId)
    if (!profile) {
      throw new Error('Profile not found for user')
    }

    // Update using existing updateProfile method
    return this.updateProfile(profile.id, data)
  }

  /**
   * Update profile verification status (admin only)
   * Uses admin client to bypass RLS policies
   */
  async updateVerificationStatus(
    id: string,
    isVerified: boolean
  ): Promise<Profile> {
    const updateData: Partial<Profile> = {
      is_verified: isVerified,
      verified_at: isVerified ? new Date().toISOString() : null,
    }

    // Use admin client to bypass RLS for admin operations
    const adminClient = createAdminClient()
    const { data: profile, error } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to update verification status: ${error.message}`)
    }

    if (!profile) {
      throw new Error(`Profile with id ${id} not found or could not be updated`)
    }

    return profile as Profile
  }

  /**
   * Get all profile slugs and updated_at timestamps (for sitemap generation)
   */
  async getAllProfileSlugs(): Promise<Array<{ slug: string; updated_at: string }>> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch profile slugs: ${error.message}`)
    }

    return data as Array<{ slug: string; updated_at: string }>
  }

  /**
   * Search profiles with full-text search, filters, and pagination
   * Returns profiles with top 3 credits ordered by display_order
   */
  async searchProfiles(
    textQuery?: string,
    filters?: SearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    profiles: Array<Profile & { credits: Credit[] }>
    total: number
  }> {
    // Normalize pagination
    const normalizedPage = Math.max(1, Math.floor(page))
    const normalizedLimit = Math.max(1, Math.min(100, Math.floor(limit)))
    const offset = (normalizedPage - 1) * normalizedLimit

    // Get total count
    const normalizedRole = filters?.role?.toLowerCase() || null

    const { data: totalCount, error: countError } = await this.supabase.rpc(
      'search_profiles_count',
      {
        search_text: textQuery || null,
        filter_role: normalizedRole,
        filter_city: filters?.city || null,
        filter_state: filters?.state || null,
        filter_years_min: filters?.years_experience_min || null,
        filter_years_max: filters?.years_experience_max || null,
      }
    )

    if (countError) {
      throw new Error(`Failed to count search results: ${countError.message}`)
    }

    const total = totalCount || 0

    // Call RPC function for full-text search with filters and pagination
    const { data: searchResults, error: searchError } = await this.supabase.rpc(
      'search_profiles',
      {
        search_text: textQuery || null,
        filter_role: normalizedRole,
        filter_city: filters?.city || null,
        filter_state: filters?.state || null,
        filter_years_min: filters?.years_experience_min || null,
        filter_years_max: filters?.years_experience_max || null,
        result_limit: normalizedLimit,
        result_offset: offset,
      }
    )

    if (searchError) {
      throw new Error(`Failed to search profiles: ${searchError.message}`)
    }

    const profiles = (searchResults || []) as Profile[]

    // Fetch credits for all profiles in a single query instead of N+1
    const profileIds = profiles.map((p) => p.id)
    let allCredits: Credit[] = []

    if (profileIds.length > 0) {
      const { data: credits, error: creditsError } = await this.supabase
        .from('credits')
        .select(
          `
          id,
          profile_id,
          project_title,
          role,
          project_type,
          year,
          production_company,
          director,
          display_order,
          created_at,
          updated_at
        `
        )
        .in('profile_id', profileIds)
        .order('display_order', { ascending: true })

      if (creditsError) {
        console.error('Failed to fetch credits:', creditsError)
      } else {
        allCredits = (credits || []) as Credit[]
      }
    }

    // Group credits by profile_id and take top 3 each
    const creditsByProfile = new Map<string, Credit[]>()
    for (const credit of allCredits) {
      const existing = creditsByProfile.get(credit.profile_id) || []
      if (existing.length < 3) {
        existing.push(credit)
        creditsByProfile.set(credit.profile_id, existing)
      }
    }

    const profilesWithCredits = profiles.map((profile) => ({
      ...profile,
      credits: creditsByProfile.get(profile.id) || [],
    }))

    return {
      profiles: profilesWithCredits,
      total,
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService()


