import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/middleware/auth'

/**
 * POST /api/admin/profiles/:id/claim
 * Link a profile to a user account by email.
 * If no account exists, one is created automatically and a password reset email is sent.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get the profile first to grab their name
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, user_id')
      .eq('id', params.id)
      .single()

    if (profileError || !targetProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (targetProfile.user_id) {
      return NextResponse.json(
        { error: 'This profile is already linked to an account.' },
        { status: 409 }
      )
    }

    // Find or create the user by email
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      return NextResponse.json({ error: 'Failed to look up users' }, { status: 500 })
    }

    let user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase().trim())
    let accountCreated = false

    if (!user) {
      // Create account for them with a random password — they'll reset it
      const tempPassword = crypto.randomUUID() + 'A1!'
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: targetProfile.name,
          role: 'crew',
        },
      })

      if (createError) {
        return NextResponse.json(
          { error: `Failed to create account: ${createError.message}` },
          { status: 500 }
        )
      }

      user = authData.user
      accountCreated = true

      // Send password reset so they can set their own password
      await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email.toLowerCase().trim(),
      })
    }

    // Check if this user already owns a different profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: `This user already owns the profile "${existingProfile.name}". Unlink that one first.` },
        { status: 409 }
      )
    }

    // Ensure user exists in public.users table (required by FK)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      const { error: userError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        role: 'crew',
      })
      if (userError) {
        return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
      }
    }

    // Link the profile to the user
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ user_id: user.id, is_claimed: true })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to link profile' }, { status: 500 })
    }

    const message = accountCreated
      ? `Profile "${profile.name}" linked to ${email}. Account created — they'll receive a password reset email.`
      : `Profile "${profile.name}" linked to ${email}.`

    return NextResponse.json({
      success: true,
      message,
      accountCreated,
      profile,
    })
  } catch (error) {
    console.error('Error linking profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
