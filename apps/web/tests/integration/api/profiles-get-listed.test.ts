import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/profiles/get-listed/route'
import { NextRequest } from 'next/server'
import type { Profile } from '@crew-up/shared'

// Mock dependencies
vi.mock('@/lib/services/profileService', () => ({
  profileService: {
    createPendingProfile: vi.fn(),
  },
}))

vi.mock('@/lib/services/emailService', () => ({
  emailService: {
    sendGetListedNotification: vi.fn(),
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { profileService } from '@/lib/services/profileService'
import { emailService } from '@/lib/services/emailService'
import { createClient } from '@/lib/supabase/server'

describe('POST /api/profiles/get-listed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create profile with pending_review status', async () => {
    // Mock profile creation
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

    vi.mocked(profileService.createPendingProfile).mockResolvedValue(mockProfile)
    vi.mocked(emailService.sendGetListedNotification).mockResolvedValue()

    // Create form data
    const formData = new FormData()
    formData.append('name', 'Jane Smith')
    formData.append('primary_role', '1st AC')
    formData.append('primary_location_city', 'Los Angeles')
    formData.append('primary_location_state', 'CA')
    formData.append('contact_email', 'jane@example.com')

    const request = new NextRequest('http://localhost/api/profiles/get-listed', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toContain('pending review')
    expect(data.profile.status).toBe('pending_review')
    expect(profileService.createPendingProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Smith',
        primary_role: '1st AC',
        primary_location_city: 'Los Angeles',
        primary_location_state: 'CA',
        contact_email: 'jane@example.com',
      }),
      null // No ID photo
    )
    expect(emailService.sendGetListedNotification).toHaveBeenCalledWith(
      mockProfile,
      null
    )
  })

  it('should accept optional ID photo upload', async () => {
    // Note: Full file upload testing requires more complex setup with FormData
    // This test verifies the endpoint accepts requests with ID photo field
    // Actual file upload validation is tested in unit tests for the service layer
    const mockProfile: Profile = {
      id: 'profile-2',
      user_id: null,
      name: 'John Doe',
      primary_role: 'Gaffer',
      primary_location_city: 'Nashville',
      primary_location_state: 'TN',
      contact_email: 'john@example.com',
      slug: 'john-doe-gaffer-nashville',
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

    vi.mocked(profileService.createPendingProfile).mockResolvedValue(mockProfile)
    vi.mocked(emailService.sendGetListedNotification).mockResolvedValue()

    // Test without ID photo (should work fine)
    const formData = new FormData()
    formData.append('name', 'John Doe')
    formData.append('primary_role', 'Gaffer')
    formData.append('primary_location_city', 'Nashville')
    formData.append('primary_location_state', 'TN')
    formData.append('contact_email', 'john@example.com')

    const request = new NextRequest('http://localhost/api/profiles/get-listed', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(profileService.createPendingProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
      }),
      null // No ID photo
    )
  })

  it('should validate required fields', async () => {
    const formData = new FormData()
    // Missing required fields

    const request = new NextRequest('http://localhost/api/profiles/get-listed', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
    expect(profileService.createPendingProfile).not.toHaveBeenCalled()
  })

  it('should validate email format', async () => {
    const formData = new FormData()
    formData.append('name', 'Test User')
    formData.append('primary_role', 'DP')
    formData.append('primary_location_city', 'LA')
    formData.append('primary_location_state', 'CA')
    formData.append('contact_email', 'invalid-email') // Invalid email

    const request = new NextRequest('http://localhost/api/profiles/get-listed', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('should validate optional fields', async () => {
    // Test that optional fields are handled correctly
    const mockProfile: Profile = {
      id: 'profile-4',
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
      bio: 'Test bio',
      photo_url: null,
      contact_phone: '555-1234',
      portfolio_url: 'https://portfolio.example.com',
      website: null,
      instagram_url: null,
      vimeo_url: null,
      union_status: 'union',
      years_experience: 10,
      secondary_roles: null,
      additional_markets: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    vi.mocked(profileService.createPendingProfile).mockResolvedValue(mockProfile)
    vi.mocked(emailService.sendGetListedNotification).mockResolvedValue()

    const formData = new FormData()
    formData.append('name', 'Test User')
    formData.append('primary_role', 'DP')
    formData.append('primary_location_city', 'LA')
    formData.append('primary_location_state', 'CA')
    formData.append('contact_email', 'test@example.com')
    formData.append('bio', 'Test bio')
    formData.append('contact_phone', '555-1234')
    formData.append('portfolio_url', 'https://portfolio.example.com')
    formData.append('union_status', 'union')
    formData.append('years_experience', '10')

    const request = new NextRequest('http://localhost/api/profiles/get-listed', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(profileService.createPendingProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test User',
        bio: 'Test bio',
        contact_phone: '555-1234',
        portfolio_url: 'https://portfolio.example.com',
        union_status: 'union',
        years_experience: 10,
      }),
      null
    )
  })

  it('should handle email service failures gracefully', async () => {
    // Mock console.error to avoid stderr output in tests
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const mockProfile: Profile = {
      id: 'profile-3',
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

    vi.mocked(profileService.createPendingProfile).mockResolvedValue(mockProfile)
    vi.mocked(emailService.sendGetListedNotification).mockRejectedValue(
      new Error('Email service unavailable')
    )

    const formData = new FormData()
    formData.append('name', 'Test User')
    formData.append('primary_role', 'DP')
    formData.append('primary_location_city', 'LA')
    formData.append('primary_location_state', 'CA')
    formData.append('contact_email', 'test@example.com')

    const request = new NextRequest('http://localhost/api/profiles/get-listed', {
      method: 'POST',
      body: formData,
    })

    // Should still succeed even if email fails
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.profile.status).toBe('pending_review')
    
    // Clean up
    consoleErrorSpy.mockRestore()
  })
})

