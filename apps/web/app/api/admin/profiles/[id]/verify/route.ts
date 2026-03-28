import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware/auth'
import { profileService } from '@/lib/services/profileService'
import { handleError } from '@/lib/utils/errorHandler'
import { z } from 'zod'

const verifyProfileSchema = z.object({
  is_verified: z.boolean(),
})

export async function POST(
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
    const { is_verified } = verifyProfileSchema.parse(body)

    // Update verification status
    const updatedProfile = await profileService.updateVerificationStatus(id, is_verified)

    return NextResponse.json(
      {
        message: `Profile ${is_verified ? 'verified' : 'unverified'} successfully`,
        profile: updatedProfile,
      },
      { status: 200 }
    )
  } catch (error) {
    return handleError(error)
  }
}

