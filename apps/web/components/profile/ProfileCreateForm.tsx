'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

// Role options by department
const ROLE_OPTIONS = {
  camera: [
    'Director of Photography (DP)',
    '1st AC',
    '2nd AC',
    'Camera Operator',
    'Steadicam Operator',
    'DIT',
    'Camera PA',
    'Other',
  ],
  production: [
    'Producer',
    'Executive Producer',
    'Line Producer',
    'Production Manager',
    'Production Coordinator',
    '1st AD',
    '2nd AD',
    'Production Assistant',
    'Other',
  ],
  lighting: [
    'Gaffer',
    'Best Boy Electric',
    'Electric',
    'Lighting Designer',
    'Other',
  ],
  grip: [
    'Key Grip',
    'Best Boy Grip',
    'Grip',
    'Dolly Grip',
    'Other',
  ],
  art: [
    'Production Designer',
    'Art Director',
    'Set Designer',
    'Set Decorator',
    'Prop Master',
    'Art Department Coordinator',
    'Set Dresser',
    'Other',
  ],
  sound: [
    'Production Sound Mixer',
    'Boom Operator',
    'Sound Utility',
    'Playback Operator',
    'Other',
  ],
} as const

// All roles combined (for search when no department is selected)
const ALL_ROLES = [
  ...ROLE_OPTIONS.camera,
  ...ROLE_OPTIONS.production,
  ...ROLE_OPTIONS.lighting,
  ...ROLE_OPTIONS.grip,
  ...ROLE_OPTIONS.art,
  ...ROLE_OPTIONS.sound,
].filter((role, index, self) => self.indexOf(role) === index) // Remove duplicates

// Zod schema for form validation (matches API schema)
const profileCreateFormSchema = z.object({
  // Profile fields
  name: z.string().min(1, 'Name is required'),
  department: z.enum(['camera', 'production', 'lighting', 'grip', 'art', 'sound']).optional().nullable().or(z.literal('')),
  primary_role: z.string().min(1, 'Primary role is required'),
  primary_location_city: z.string().min(1, 'City is required'),
  primary_location_state: z.string().length(2, 'State must be 2-letter code'),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().optional().nullable(),
  bio: z.string().max(250, 'Bio must be 250 characters or less').optional().nullable(),
  portfolio_url: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  website: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  instagram_url: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  vimeo_url: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  union_status: z.enum(['union', 'non-union', 'either']).optional().nullable(),
  years_experience: z.number().int().positive().optional().nullable(),
  secondary_roles: z.array(z.string()).optional().nullable(),
  additional_markets: z
    .array(
      z.object({
        city: z.string().min(1, 'City is required'),
        state: z.string().length(2, 'State must be 2-letter code'),
      })
    )
    .optional()
    .nullable(),
})

type ProfileCreateFormData = z.infer<typeof profileCreateFormSchema>

export function ProfileCreateForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
    claimUrl?: string
  }>({ type: null, message: '' })
  const [roleSearchTerm, setRoleSearchTerm] = useState('')
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)

  // Check authentication status on mount (optional - for redirecting authenticated users)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        setIsAuthenticated(response.ok)
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = useForm<ProfileCreateFormData>({
    resolver: zodResolver(profileCreateFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      department: null,
      primary_role: '',
      primary_location_city: '',
      primary_location_state: '',
      contact_email: '',
      contact_phone: '',
      bio: '',
      portfolio_url: '',
      website: '',
      instagram_url: '',
      vimeo_url: '',
      union_status: null,
      years_experience: null,
      secondary_roles: [],
      additional_markets: [],
    },
  })

  // Use explicit generic types and type assertions to help TypeScript infer the correct field paths
  const { fields: secondaryRoleFields, append: appendSecondaryRole, remove: removeSecondaryRole } = useFieldArray({
    control,
    name: 'secondary_roles' as any,
  })

  const { fields: additionalMarketFields, append: appendAdditionalMarket, remove: removeAdditionalMarket } = useFieldArray({
    control,
    name: 'additional_markets' as any,
  })

  // Clear role when department changes
  const department = watch('department')
  useEffect(() => {
    if (department) {
      setValue('primary_role', '')
      setRoleSearchTerm('')
      setShowRoleDropdown(false)
    }
  }, [department, setValue])

  const onSubmit = async (data: ProfileCreateFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // Clean up empty strings to null for optional fields
      const cleanedData = {
        name: data.name,
        department: data.department || null,
        primary_role: data.primary_role,
        primary_location_city: data.primary_location_city,
        primary_location_state: data.primary_location_state,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || null,
        bio: data.bio || null,
        portfolio_url: data.portfolio_url || null,
        website: data.website || null,
        instagram_url: data.instagram_url || null,
        vimeo_url: data.vimeo_url || null,
        union_status: data.union_status || null,
        years_experience: data.years_experience || null,
        secondary_roles: data.secondary_roles && data.secondary_roles.length > 0 ? data.secondary_roles : null,
        additional_markets: data.additional_markets && data.additional_markets.length > 0 ? data.additional_markets : null,
      }

      // Create profile (no authentication required)
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      })

      const result = await response.json()

      if (!response.ok) {
        // Show detailed error message
        let errorMessage = result.error?.message || 'Failed to create profile. Please try again.'
        
        // Add validation error details if available
        if (result.error?.code === 'VALIDATION_ERROR' && result.error?.details) {
          const validationErrors = result.error.details
            .map((err: any) => `${err.path.join('.')}: ${err.message}`)
            .join(', ')
          errorMessage = `Validation error: ${validationErrors}`
        }
        
        // Log full error for debugging
        console.error('Profile creation failed:', result)
        
        setSubmitStatus({ type: 'error', message: errorMessage })
        return
      }

      // Show success message with claim link
      const claimUrl = result.claimToken 
        ? `/claim/${result.claimToken}`
        : null

      // Store claim URL for display in success message
      setSubmitStatus({
        type: 'success',
        message: claimUrl
          ? `Profile created successfully! Check your email (${data.contact_email}) for a claim link, or claim your profile now.`
          : `Profile created successfully! Check your email (${data.contact_email}) for a claim link to manage your profile.`,
        claimUrl: claimUrl || undefined,
      })

      // If authenticated user created profile, redirect to edit page
      if (isAuthenticated) {
        setTimeout(() => {
          router.push('/profile/edit')
        }, 3000)
      }
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Get Listed</h1>
      <p className="text-muted-foreground mb-6">
        Create your professional profile to connect with producers and other crew members. No account needed - we&apos;ll send you a claim link via email to manage your profile later.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Basic Information */}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-2">
              Department
            </label>
            <select
              id="department"
              {...register('department')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select department (optional)</option>
              <option value="camera">Camera</option>
              <option value="production">Production</option>
              <option value="lighting">Lighting</option>
              <option value="grip">Grip</option>
              <option value="art">Art Department</option>
              <option value="sound">Sound</option>
            </select>
            {errors.department && (
              <p id="department-error" className="mt-1 text-sm text-destructive" role="alert">
                {errors.department.message}
              </p>
            )}
          </div>

          {/* Primary Role */}
          <div className="relative">
            <label htmlFor="primary_role" className="block text-sm font-medium mb-2">
              Primary Role <span className="text-destructive">*</span>
            </label>
            {watch('department') && watch('department') in ROLE_OPTIONS ? (
              <select
                id="primary_role"
                {...register('primary_role')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                aria-invalid={errors.primary_role ? 'true' : 'false'}
                aria-describedby={errors.primary_role ? 'primary_role-error' : undefined}
              >
                <option value="">Select a role</option>
                {ROLE_OPTIONS[watch('department') as keyof typeof ROLE_OPTIONS].map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input
                  id="primary_role"
                  type="text"
                  value={watch('primary_role') || roleSearchTerm}
                  onChange={(e) => {
                    const value = e.target.value
                    setRoleSearchTerm(value)
                    setValue('primary_role', value, { shouldValidate: false })
                    setShowRoleDropdown(true)
                  }}
                  onFocus={() => {
                    if (!watch('primary_role')) {
                      setRoleSearchTerm('')
                    }
                    setShowRoleDropdown(true)
                  }}
                  onBlur={() => {
                    // Delay to allow click on dropdown item
                    setTimeout(() => {
                      setShowRoleDropdown(false)
                      // Keep whatever the user typed as their role
                      const currentRole = watch('primary_role')
                      if (currentRole) {
                        setRoleSearchTerm(currentRole)
                      }
                    }, 200)
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Type to search roles..."
                  aria-invalid={errors.primary_role ? 'true' : 'false'}
                  aria-describedby={errors.primary_role ? 'primary_role-error' : undefined}
                  autoComplete="off"
                />
                {showRoleDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded max-h-60 overflow-auto">
                    {ALL_ROLES
                      .filter((role) =>
                        role.toLowerCase().includes(roleSearchTerm.toLowerCase())
                      )
                      .slice(0, 20) // Limit to 20 results
                      .map((role) => (
                        <button
                          key={role}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none text-sm"
                          onClick={() => {
                            setValue('primary_role', role)
                            setRoleSearchTerm(role)
                            setShowRoleDropdown(false)
                          }}
                        >
                          {role}
                        </button>
                      ))}
                    {ALL_ROLES.filter((role) =>
                      role.toLowerCase().includes(roleSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-2 text-muted-foreground text-sm">No roles found</div>
                    )}
                  </div>
                )}
              </>
            )}
            {errors.primary_role && (
              <p id="primary_role-error" className="mt-1 text-sm text-destructive" role="alert">
                {errors.primary_role.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="primary_location_city" className="block text-sm font-medium mb-2">
                City <span className="text-destructive">*</span>
              </label>
              <input
                id="primary_location_city"
                type="text"
                {...register('primary_location_city')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                aria-invalid={errors.primary_location_city ? 'true' : 'false'}
                aria-describedby={errors.primary_location_city ? 'primary_location_city-error' : undefined}
              />
              {errors.primary_location_city && (
                <p id="primary_location_city-error" className="mt-1 text-sm text-destructive" role="alert">
                  {errors.primary_location_city.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="primary_location_state" className="block text-sm font-medium mb-2">
                State <span className="text-destructive">*</span>
              </label>
              <input
                id="primary_location_state"
                type="text"
                maxLength={2}
                {...register('primary_location_state')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                placeholder="CA"
                aria-invalid={errors.primary_location_state ? 'true' : 'false'}
                aria-describedby={errors.primary_location_state ? 'primary_location_state-error' : undefined}
              />
              {errors.primary_location_state && (
                <p id="primary_location_state-error" className="mt-1 text-sm text-destructive" role="alert">
                  {errors.primary_location_state.message}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              {...register('bio')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              placeholder="Tell us about yourself..."
              aria-invalid={errors.bio ? 'true' : 'false'}
              aria-describedby={errors.bio ? 'bio-error' : undefined}
            />
            {errors.bio && (
              <p id="bio-error" className="mt-1 text-sm text-destructive" role="alert">
                {errors.bio.message}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              Maximum 250 characters ({watch('bio')?.length || 0}/250)
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

          {/* Contact Email */}
          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium mb-2">
              Contact Email <span className="text-destructive">*</span>
            </label>
            <input
              id="contact_email"
              type="email"
              {...register('contact_email')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-invalid={errors.contact_email ? 'true' : 'false'}
              aria-describedby={errors.contact_email ? 'contact_email-error' : undefined}
            />
            {errors.contact_email && (
              <p id="contact_email-error" className="mt-1 text-sm text-destructive" role="alert">
                {errors.contact_email.message}
              </p>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium mb-2">
              Contact Phone
            </label>
            <input
              id="contact_phone"
              type="tel"
              {...register('contact_phone')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-invalid={errors.contact_phone ? 'true' : 'false'}
              aria-describedby={errors.contact_phone ? 'contact_phone-error' : undefined}
            />
            {errors.contact_phone && (
              <p id="contact_phone-error" className="mt-1 text-sm text-destructive" role="alert">
                {errors.contact_phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Professional Details */}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-xl font-semibold mb-4">Professional Details</h2>

          {/* Union Status */}
          <div>
            <label htmlFor="union_status" className="block text-sm font-medium mb-2">
              Union Status
            </label>
            <select
              id="union_status"
              {...register('union_status')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select union status</option>
              <option value="union">Union</option>
              <option value="non-union">Non-Union</option>
              <option value="either">Either</option>
            </select>
          </div>

          {/* Years Experience */}
          <div>
            <label htmlFor="years_experience" className="block text-sm font-medium mb-2">
              Years of Experience
            </label>
            <input
              id="years_experience"
              type="number"
              min="0"
              {...register('years_experience', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-invalid={errors.years_experience ? 'true' : 'false'}
              aria-describedby={errors.years_experience ? 'years_experience-error' : undefined}
            />
            {errors.years_experience && (
              <p id="years_experience-error" className="mt-1 text-sm text-destructive" role="alert">
                {errors.years_experience.message}
              </p>
            )}
          </div>

          {/* Secondary Roles */}
          <div>
            <label className="block text-sm font-medium mb-2">Secondary Roles</label>
            {secondaryRoleFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <input
                  type="text"
                  {...register(`secondary_roles.${index}`)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Secondary role"
                />
                <button
                  type="button"
                  onClick={() => removeSecondaryRole(index)}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendSecondaryRole('')}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Add Secondary Role
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-xl font-semibold mb-4">Links</h2>

          {/* Portfolio URL */}
          <div>
            <label htmlFor="portfolio_url" className="block text-sm font-medium mb-2">
              Portfolio URL
            </label>
            <input
              id="portfolio_url"
              type="url"
              {...register('portfolio_url')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://example.com/portfolio"
              aria-invalid={errors.portfolio_url ? 'true' : 'false'}
              aria-describedby={errors.portfolio_url ? 'portfolio_url-error' : undefined}
            />
            {errors.portfolio_url && (
              <p id="portfolio_url-error" className="mt-1 text-sm text-destructive" role="alert">
                {errors.portfolio_url.message}
              </p>
            )}
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium mb-2">
              Website
            </label>
            <input
              id="website"
              type="url"
              {...register('website')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://example.com"
              aria-invalid={errors.website ? 'true' : 'false'}
              aria-describedby={errors.website ? 'website-error' : undefined}
            />
            {errors.website && (
              <p id="website-error" className="mt-1 text-sm text-destructive" role="alert">
                {errors.website.message}
              </p>
            )}
          </div>

          {/* Instagram URL */}
          <div>
            <label htmlFor="instagram_url" className="block text-sm font-medium mb-2">
              Instagram URL
            </label>
            <input
              id="instagram_url"
              type="url"
              {...register('instagram_url')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://instagram.com/username"
              aria-invalid={errors.instagram_url ? 'true' : 'false'}
              aria-describedby={errors.instagram_url ? 'instagram_url-error' : undefined}
            />
            {errors.instagram_url && (
              <p id="instagram_url-error" className="mt-1 text-sm text-destructive" role="alert">
                {errors.instagram_url.message}
              </p>
            )}
          </div>

          {/* Vimeo URL */}
          <div>
            <label htmlFor="vimeo_url" className="block text-sm font-medium mb-2">
              Vimeo URL
            </label>
            <input
              id="vimeo_url"
              type="url"
              {...register('vimeo_url')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://vimeo.com/username"
              aria-invalid={errors.vimeo_url ? 'true' : 'false'}
              aria-describedby={errors.vimeo_url ? 'vimeo_url-error' : undefined}
            />
            {errors.vimeo_url && (
              <p id="vimeo_url-error" className="mt-1 text-sm text-destructive" role="alert">
                {errors.vimeo_url.message}
              </p>
            )}
          </div>
        </div>

        {/* Additional Markets */}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-xl font-semibold mb-4">Additional Markets</h2>
          {additionalMarketFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-2">
              <input
                type="text"
                {...register(`additional_markets.${index}.city`)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="City"
              />
              <input
                type="text"
                maxLength={2}
                {...register(`additional_markets.${index}.state`)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                placeholder="State"
              />
              <button
                type="button"
                onClick={() => removeAdditionalMarket(index)}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendAdditionalMarket({ city: '', state: '' })}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Add Market
          </button>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </div>

        {/* Status Messages */}
        {submitStatus.type === 'success' && (
          <div
            className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 space-y-2"
            role="alert"
          >
            <p>{submitStatus.message}</p>
            {submitStatus.claimUrl && (
              <a
                href={submitStatus.claimUrl}
                className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Claim Your Profile Now
              </a>
            )}
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
    </div>
  )
}

