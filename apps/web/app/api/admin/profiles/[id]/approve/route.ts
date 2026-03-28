import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware/auth'
import { profileService } from '@/lib/services/profileService'
import { emailService } from '@/lib/services/emailService'
import { handleError } from '@/lib/utils/errorHandler'

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

    // Check if priority flags were sent
    let lowPriority = false
    let highPriority = false
    try {
      const body = await request.json()
      lowPriority = body.low_priority === true
      highPriority = body.high_priority === true
    } catch {
      // No body or invalid JSON — defaults to false
    }

    // Update profile status to approved
    const updatedProfile = await profileService.updateProfileStatus(id, 'approved')

    // Set priority flags if requested
    if (lowPriority) {
      await profileService.updateProfileAsAdmin(id, { is_low_priority: true })
    }
    if (highPriority) {
      await profileService.updateProfileAsAdmin(id, { is_featured: true })
    }

    // Send approval email to user (non-blocking)
    try {
      // Note: We'll create this email template in a future task if needed
      // For now, we'll just log that approval happened
      console.log(`Profile ${id} approved. Email should be sent to ${profile.contact_email}`)
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        message: 'Profile approved successfully',
        profile: updatedProfile,
      },
      { status: 200 }
    )
  } catch (error) {
    return handleError(error)
  }
}

