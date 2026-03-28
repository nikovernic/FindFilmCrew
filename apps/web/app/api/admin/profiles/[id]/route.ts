import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware/auth'
import { profileService } from '@/lib/services/profileService'
import { handleError } from '@/lib/utils/errorHandler'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { id } = params

    // Get profile by ID
    const profile = await profileService.getProfileById(id)
    if (!profile) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Profile not found',
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}

// Zod schema for admin profile update (all fields optional for partial updates)
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  primary_role: z.string().min(1, 'Primary role is required').optional(),
  primary_location_city: z.string().min(1, 'City is required').optional(),
  primary_location_state: z.string().length(2, 'State must be 2-letter code').optional(),
  contact_email: z.string().email('Invalid email address').optional(),
  contact_phone: z.string().optional().nullable(),
  bio: z.string().max(2000, 'Bio must be 2000 characters or less').optional().nullable(),
  portfolio_url: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  website: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  instagram_url: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  vimeo_url: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  imdb_url: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  union_status: z.enum(['union', 'non-union', 'either']).optional().nullable(),
  years_experience: z.number().int().positive().optional().nullable(),
  secondary_roles: z.array(z.string()).optional().nullable(),
  specialties: z.array(z.string()).optional().nullable(),
  additional_markets: z
    .array(
      z.object({
        city: z.string().min(1, 'City is required'),
        state: z.string().length(2, 'State must be 2-letter code'),
      })
    )
    .optional()
    .nullable(),
  photo_url: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  credits: z.string().optional().nullable(),
  is_featured: z.boolean().optional(),
  is_low_priority: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { id } = params

    // Get profile to verify it exists
    const profile = await profileService.getProfileById(id)
    if (!profile) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Profile not found',
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Update profile (admin can update any profile - use admin method to bypass RLS)
    const updatedProfile = await profileService.updateProfileAsAdmin(id, validatedData)

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        profile: updatedProfile,
      },
      { status: 200 }
    )
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    const { id } = params

    const profile = await profileService.getProfileById(id)
    if (!profile) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Profile not found',
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        },
        { status: 404 }
      )
    }

    await profileService.deleteProfile(id)

    return NextResponse.json(
      { message: 'Profile deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    return handleError(error)
  }
}

