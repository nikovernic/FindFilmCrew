'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// Zod schema for form validation
const signInFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormData = z.infer<typeof signInFormSchema>

export function SignInForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const supabase = createClient()
      console.log('Attempting sign in for:', data.email)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      console.log('Sign in result:', { authData, authError })

      if (authError) {
        console.error('Sign in error:', authError.message)
        let errorMessage = 'Failed to sign in. Please try again.'
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address before signing in.'
        }
        setSubmitStatus({ type: 'error', message: errorMessage })
        return
      }

      // Success - redirect to profile edit page
      console.log('Sign in successful, redirecting...')
      window.location.href = '/profile/edit'
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>
      
      <p className="text-muted-foreground mb-6">
        Sign in to your account to manage your profile
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-2"
          >
            Email Address <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            autoComplete="email"
          />
          {errors.email && (
            <p
              id="email-error"
              className="mt-1 text-sm text-destructive"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-2"
          >
            Password <span className="text-destructive">*</span>
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            autoComplete="current-password"
          />
          {errors.password && (
            <p
              id="password-error"
              className="mt-1 text-sm text-destructive"
              role="alert"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        {/* Status Messages */}
        {submitStatus.type === 'success' && (
          <div
            className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800"
            role="alert"
          >
            {submitStatus.message}
          </div>
        )}

        {submitStatus.type === 'error' && (
          <div
            className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800"
            role="alert"
          >
            {submitStatus.message}
          </div>
        )}
      </form>

      <div className="mt-8 pt-6 border-t">
        <p className="text-sm font-medium mb-4">Don&apos;t have an account?</p>
        <div className="space-y-3">
          <Link
            href="/signup"
            className="block w-full px-4 py-3 border rounded-md text-center hover:bg-accent transition-colors"
          >
            <span className="font-medium text-sm">I&apos;m a Producer / PM / PC</span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              Create an account to access crew contact info
            </span>
          </Link>
          <Link
            href="/get-listed"
            className="block w-full px-4 py-3 border rounded-md text-center hover:bg-accent transition-colors"
          >
            <span className="font-medium text-sm">I&apos;m a Crew Member</span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              Get listed in the directory and create your account
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

