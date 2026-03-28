import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError } from '@/lib/utils/errorHandler'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  name: z.string().min(1, 'Name is required').max(100),
  role: z.string().max(100).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = signUpSchema.parse(body)

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          name,
          role: role || 'producer',
        },
      },
    })

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          {
            error: {
              code: 'EMAIL_ALREADY_EXISTS',
              message: 'An account with this email already exists. Please sign in instead.',
            },
          },
          { status: 409 }
        )
      }
      throw new Error(`Sign-up failed: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Sign-up failed: No user returned')
    }

    // Auto sign-in immediately after signup
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      // Account created but auto sign-in failed — user can sign in manually
      return NextResponse.json(
        {
          message: 'Account created. Please sign in.',
          user: { id: authData.user.id, email: authData.user.email },
          autoSignedIn: false,
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      {
        message: 'Account created and signed in',
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        autoSignedIn: true,
      },
      { status: 201 }
    )
  } catch (error) {
    return handleError(error)
  }
}
