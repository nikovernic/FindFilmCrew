import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware/auth'
import { profileService } from '@/lib/services/profileService'
import { emailService } from '@/lib/services/emailService'
import { handleError } from '@/lib/utils/errorHandler'
import { z } from 'zod'

const rejectSchema = z.object({
  reason: z.string().optional().nullable(),
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

    // Parse request body for optional reason
    const body = await request.json().catch(() => ({}))
    const { reason } = rejectSchema.parse(body)

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

    // Update profile status to rejected
    const updatedProfile = await profileService.updateProfileStatus(id, 'rejected')

    // Send rejection email to user (non-blocking)
    try {
      // Note: We'll create this email template in a future task if needed
      // For now, we'll just log that rejection happened
      console.log(
        `Profile ${id} rejected. Email should be sent to ${profile.contact_email}. Reason: ${reason || 'Not provided'}`
      )
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        message: 'Profile rejected successfully',
        profile: updatedProfile,
      },
      { status: 200 }
    )
  } catch (error) {
    return handleError(error)
  }
}

