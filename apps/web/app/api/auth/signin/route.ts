import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/authService'
import { handleError } from '@/lib/utils/errorHandler'
import { z } from 'zod'

// Zod schema for sign-in request
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = signInSchema.parse(body)

    const { email, password } = validatedData

    // Authenticate user with Supabase Auth
    try {
      // Use Supabase client directly in API route to properly handle cookies
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()
      
      // Sign in with password - this will set cookies automatically
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Map Supabase auth errors to application errors
        if (authError.message.includes('Invalid login credentials')) {
          return NextResponse.json(
            {
              error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
                timestamp: new Date().toISOString(),
                requestId: crypto.randomUUID(),
              },
            },
            { status: 401 }
          )
        }
        if (authError.message.includes('Email not confirmed')) {
          return NextResponse.json(
            {
              error: {
                code: 'EMAIL_NOT_CONFIRMED',
                message: 'Please confirm your email address before signing in',
                timestamp: new Date().toISOString(),
                requestId: crypto.randomUUID(),
              },
            },
            { status: 401 }
          )
        }
        throw authError
      }

      if (!authData.user || !authData.session) {
        throw new Error('Authentication failed: No user or session returned')
      }

      // Check if user is admin to determine redirect URL
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      // Determine redirect URL based on user role
      let redirectUrl = '/profile/edit' // Default for crew members
      if (userData?.role === 'admin') {
        redirectUrl = '/admin'
      }

      // Create response with JSON body
      const response = NextResponse.json(
        {
          message: 'Sign-in successful',
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
          redirectUrl,
        },
        { status: 200 }
      )

      // Supabase SSR automatically sets cookies via the createClient cookie handlers
      // The cookies are already set in the supabase client, we just need to return the response
      return response
    } catch (error) {
      // Handle auth service errors
      if (error instanceof Error) {
        if (error.message === 'INVALID_CREDENTIALS') {
          return NextResponse.json(
            {
              error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
                timestamp: new Date().toISOString(),
                requestId: crypto.randomUUID(),
              },
            },
            { status: 401 }
          )
        }

        if (error.message === 'EMAIL_NOT_CONFIRMED') {
          return NextResponse.json(
            {
              error: {
                code: 'EMAIL_NOT_CONFIRMED',
                message: 'Please confirm your email address before signing in',
                timestamp: new Date().toISOString(),
                requestId: crypto.randomUUID(),
              },
            },
            { status: 401 }
          )
        }

        // Check if account not found (user doesn't exist)
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          return NextResponse.json(
            {
              error: {
                code: 'ACCOUNT_NOT_FOUND',
                message: 'Invalid email or password',
                timestamp: new Date().toISOString(),
                requestId: crypto.randomUUID(),
              },
            },
            { status: 404 }
          )
        }
      }

      // Re-throw to be handled by handleError
      throw error
    }
  } catch (error) {
    return handleError(error)
  }
}

