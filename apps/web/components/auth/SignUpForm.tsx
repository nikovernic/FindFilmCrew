'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload, X, Shield } from 'lucide-react'

const signUpFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    role: z.string().max(100).optional(),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must contain uppercase, lowercase, and a number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignUpFormData = z.infer<typeof signUpFormSchema>

export function SignUpForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      role: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setSubmitStatus({ type: 'error', message: 'Please upload a JPG, PNG, WebP, or PDF file.' })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setSubmitStatus({ type: 'error', message: 'File must be under 10MB.' })
      return
    }

    setIdFile(file)
    setSubmitStatus({ type: null, message: '' })

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setIdPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setIdPreview(null)
    }
  }

  const removeFile = () => {
    setIdFile(null)
    setIdPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // 1. Create the account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          role: data.role || undefined,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        let errorMessage = 'Failed to create account. Please try again.'
        if (result.error?.code === 'EMAIL_ALREADY_EXISTS') {
          errorMessage = 'An account with this email already exists. Please sign in instead.'
        } else if (result.error?.message) {
          errorMessage = result.error.message
        }
        setSubmitStatus({ type: 'error', message: errorMessage })
        return
      }

      // 2. Upload ID if provided
      if (idFile && result.user?.id) {
        const formData = new FormData()
        formData.append('file', idFile)
        formData.append('userId', result.user.id)

        await fetch('/api/auth/upload-id', {
          method: 'POST',
          body: formData,
        })
        // Non-blocking — account is created even if upload fails
      }

      if (result.autoSignedIn) {
        router.push('/search')
        return
      }

      setSubmitStatus({
        type: 'success',
        message: 'Account created! You can now sign in.',
      })
    } catch {
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
      <h2 className="text-2xl font-bold mb-2">Create an Account</h2>

      <p className="text-muted-foreground mb-6 text-sm">
        Sign up for free to access crew contact information.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete="name"
            placeholder="John Smith"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-2">
            Your Role
          </label>
          <input
            id="role"
            type="text"
            {...register('role')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Producer, Production Coordinator"
          />
          <p className="mt-1 text-xs text-muted-foreground">What do you do in the industry?</p>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password <span className="text-destructive">*</span>
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirm Password <span className="text-destructive">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* ID Upload — Optional */}
        <div className="border rounded-md p-4 bg-muted/30">
          <div className="flex items-start gap-3 mb-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Upload your ID (optional)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a government-issued ID to get unlimited access to crew contact info. Without ID verification, access is limited.
              </p>
            </div>
          </div>

          {idFile ? (
            <div className="flex items-center gap-3 p-3 border rounded bg-background">
              {idPreview && (
                <img src={idPreview} alt="ID preview" className="h-12 w-12 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{idFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(idFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed rounded hover:bg-muted/50 transition-colors text-sm text-muted-foreground"
            >
              <Upload className="h-4 w-4" />
              Choose file (JPG, PNG, or PDF, max 10MB)
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2.5 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* Status Messages */}
        {submitStatus.type === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
            {submitStatus.message}
          </div>
        )}
        {submitStatus.type === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            {submitStatus.message}
          </div>
        )}

        {/* Sign In Link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/signin" className="underline hover:text-foreground">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
