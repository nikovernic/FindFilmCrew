import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/admin/profiles/[id]/approve/route'
import { NextRequest, NextResponse } from 'next/server'
import type { Profile } from '@crew-up/shared'

// Mock dependencies
vi.mock('@/lib/middleware/auth', () => ({
  requireAdmin: vi.fn(),
}))

vi.mock('@/lib/services/profileService', () => ({
  profileService: {
    getProfileById: vi.fn(),
    updateProfileStatus: vi.fn(),
  },
}))

vi.mock('@/lib/services/emailService', () => ({
  emailService: {
    sendGetListedNotification: vi.fn(),
  },
}))

import { requireAdmin } from '@/lib/middleware/auth'
import { profileService } from '@/lib/services/profileService'
import { emailService } from '@/lib/services/emailService'

describe('POST /api/admin/profiles/[id]/approve', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should approve profile and update status to approved', async () => {
    // Mock admin authentication
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: 'admin-1' },
      supabase: {} as any,
    } as any)

    const mockProfile: Profile = {
      id: 'profile-1',
      user_id: null,
      name: 'Jane Smith',
      primary_role: '1st AC',
      primary_location_city: 'Los Angeles',
      primary_location_state: 'CA',
      contact_email: 'jane@example.com',
      slug: 'jane-smith-1st-ac-los-angeles',
      is_claimed: false,
      claim_token: null,
      claim_token_expires_at: null,
      reminder_sent_at_7days: null,
      reminder_sent_at_14days: null,
      profile_status: 'pending_review',
      is_verified: false,
      verification_id_url: null,
      verification_requested_at: null,
      verified_at: null,
      bio: null,
      photo_url: null,
      contact_phone: null,
      portfolio_url: null,
      website: null,
      instagram_url: null,
      vimeo_url: null,
      union_status: null,
      years_experience: null,
      secondary_roles: null,
      additional_markets: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const approvedProfile: Profile = {
      ...mockProfile,
      profile_status: 'approved',
    }

    vi.mocked(profileService.getProfileById).mockResolvedValue(mockProfile)
    vi.mocked(profileService.updateProfileStatus).mockResolvedValue(approvedProfile)

    const request = new NextRequest('http://localhost/api/admin/profiles/profile-1/approve', {
      method: 'POST',
    })

    const response = await POST(request, { params: { id: 'profile-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Profile approved successfully')
    expect(data.profile.profile_status).toBe('approved')
    expect(profileService.updateProfileStatus).toHaveBeenCalledWith('profile-1', 'approved')
  })

  it('should require admin authentication', async () => {
    // Mock unauthorized response - requireAdmin returns NextResponse for unauthorized
    const unauthorizedResponse = NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: 'test-request-id',
        },
      },
      { status: 401 }
    )
    vi.mocked(requireAdmin).mockResolvedValue(unauthorizedResponse as any)

    const request = new NextRequest('http://localhost/api/admin/profiles/profile-1/approve', {
      method: 'POST',
    })

    const response = await POST(request, { params: { id: 'profile-1' } })

    expect(response.status).toBe(401)
    expect(profileService.updateProfileStatus).not.toHaveBeenCalled()
  })

  it('should return 404 if profile not found', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: 'admin-1' },
      supabase: {} as any,
    } as any)

    vi.mocked(profileService.getProfileById).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/admin/profiles/non-existent/approve', {
      method: 'POST',
    })

    const response = await POST(request, { params: { id: 'non-existent' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('NOT_FOUND')
    expect(profileService.updateProfileStatus).not.toHaveBeenCalled()
  })

  it('should handle database errors gracefully', async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      user: { id: 'admin-1' },
      supabase: {} as any,
    } as any)

    const mockProfile: Profile = {
      id: 'profile-1',
      user_id: null,
      name: 'Test User',
      primary_role: 'DP',
      primary_location_city: 'LA',
      primary_location_state: 'CA',
      contact_email: 'test@example.com',
      slug: 'test-user-dp-la',
      is_claimed: false,
      claim_token: null,
      claim_token_expires_at: null,
      reminder_sent_at_7days: null,
      reminder_sent_at_14days: null,
      profile_status: 'pending_review',
      is_verified: false,
      verification_id_url: null,
      verification_requested_at: null,
      verified_at: null,
      bio: null,
      photo_url: null,
      contact_phone: null,
      portfolio_url: null,
      website: null,
      instagram_url: null,
      vimeo_url: null,
      union_status: null,
      years_experience: null,
      secondary_roles: null,
      additional_markets: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    vi.mocked(profileService.getProfileById).mockResolvedValue(mockProfile)
    vi.mocked(profileService.updateProfileStatus).mockRejectedValue(
      new Error('Database error')
    )

    const request = new NextRequest('http://localhost/api/admin/profiles/profile-1/approve', {
      method: 'POST',
    })

    const response = await POST(request, { params: { id: 'profile-1' } })

    expect(response.status).toBe(500)
  })
})

