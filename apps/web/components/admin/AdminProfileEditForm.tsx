'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Profile } from '@crew-up/shared'
import Image from 'next/image'

// Zod schema for admin profile edit form validation
const adminProfileEditFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  primary_role: z.string().min(1, 'Primary role is required'),
  primary_location_city: z.string().min(1, 'City is required'),
  primary_location_state: z.string().length(2, 'State must be 2-letter code'),
  contact_email: z.string().email('Invalid email address'),
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
})

type AdminProfileEditFormData = z.infer<typeof adminProfileEditFormSchema>

interface AdminProfileEditFormProps {
  profile: Profile
  onSave: () => void
  onCancel: () => void
}

export function AdminProfileEditForm({ profile, onSave, onCancel }: AdminProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photo_url)
  const [isVerified, setIsVerified] = useState(profile.is_verified)
  const [isTogglingVerification, setIsTogglingVerification] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<AdminProfileEditFormData>({
    resolver: zodResolver(adminProfileEditFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: profile.name,
      primary_role: profile.primary_role,
      primary_location_city: profile.primary_location_city,
      primary_location_state: profile.primary_location_state,
      contact_email: profile.contact_email,
      contact_phone: profile.contact_phone || '',
      bio: profile.bio || '',
      portfolio_url: profile.portfolio_url || '',
      website: profile.website || '',
      instagram_url: profile.instagram_url || '',
      vimeo_url: profile.vimeo_url || '',
      imdb_url: profile.imdb_url || '',
      union_status: profile.union_status,
      years_experience: profile.years_experience,
      secondary_roles: profile.secondary_roles || [],
      specialties: profile.specialties || [],
      additional_markets: profile.additional_markets || [],
      photo_url: profile.photo_url || '',
      credits: profile.credits || '',
    },
  })

  const { fields: secondaryRoleFields, append: appendSecondaryRole, remove: removeSecondaryRole } =
    useFieldArray({
      control,
      name: 'secondary_roles' as any,
    })

  const { fields: specialtyFields, append: appendSpecialty, remove: removeSpecialty } =
    useFieldArray({
      control,
      name: 'specialties' as any,
    })

  const {
    fields: additionalMarketFields,
    append: appendAdditionalMarket,
    remove: removeAdditionalMarket,
  } = useFieldArray({
    control,
    name: 'additional_markets' as any,
  })

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setSubmitStatus({
        type: 'error',
        message: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.',
      })
      return
    }

    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setSubmitStatus({
        type: 'error',
        message: 'File size exceeds 5MB limit.',
      })
      return
    }

    setIsUploadingPhoto(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // Show preview immediately using FileReader
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch(`/api/admin/profiles/${profile.id}/photo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.error?.message || 'Failed to upload photo. Please try again.'
        setSubmitStatus({ type: 'error', message: errorMessage })
        setIsUploadingPhoto(false)
        return
      }

      // Update form value and preview with server URL
      setValue('photo_url', result.photo_url)
      setPhotoPreview(result.photo_url)
      
      setSubmitStatus({
        type: 'success',
        message: 'Photo uploaded successfully!',
      })
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred while uploading the photo. Please try again.',
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleToggleVerification = async () => {
    setIsTogglingVerification(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch(`/api/admin/profiles/${profile.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_verified: !isVerified }),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.error?.message || 'Failed to update verification status.'
        setSubmitStatus({ type: 'error', message: errorMessage })
        return
      }

      setIsVerified(!isVerified)
      setSubmitStatus({
        type: 'success',
        message: `Profile ${!isVerified ? 'verified' : 'unverified'} successfully!`,
      })
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.',
      })
    } finally {
      setIsTogglingVerification(false)
    }
  }

  const onSubmit = async (data: AdminProfileEditFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const cleanedData = {
        ...data,
        contact_phone: data.contact_phone || null,
        bio: data.bio || null,
        portfolio_url: data.portfolio_url || null,
        website: data.website || null,
        instagram_url: data.instagram_url || null,
        vimeo_url: data.vimeo_url || null,
        imdb_url: data.imdb_url || null,
        union_status: data.union_status || null,
        years_experience: data.years_experience || null,
        secondary_roles: data.secondary_roles && data.secondary_roles.length > 0 ? data.secondary_roles : null,
        specialties: data.specialties && data.specialties.length > 0 ? data.specialties : null,
        additional_markets:
          data.additional_markets && data.additional_markets.length > 0 ? data.additional_markets : null,
        photo_url: data.photo_url || null,
        credits: data.credits || null,
      }

      const response = await fetch(`/api/admin/profiles/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(cleanedData),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.error?.message || 'Failed to update profile. Please try again.'
        setSubmitStatus({ type: 'error', message: errorMessage })
        return
      }

      setSubmitStatus({
        type: 'success',
        message: 'Profile updated successfully!',
      })
      // Call onSave callback after a short delay to show success message
      setTimeout(() => {
        onSave()
      }, 1000)
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
    <div className="space-y-6">
      {/* Verification Toggle */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Verification Status</h3>
            <p className="text-sm text-muted-foreground">
              Current status: {isVerified ? 'Verified' : 'Unverified'}
            </p>
            {profile.verified_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Verified at: {new Date(profile.verified_at).toLocaleString()}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleToggleVerification}
            disabled={isTogglingVerification}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
              isVerified
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isTogglingVerification
              ? 'Updating...'
              : isVerified
              ? 'Mark as Unverified'
              : 'Mark as Verified'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Photo Upload */}
        <div className="border rounded-lg p-6 bg-card">
          <label className="block text-sm font-medium mb-2">Profile Photo</label>
          <div className="flex items-start gap-4">
            {photoPreview && (
              <div className="flex-shrink-0">
                <Image
                  src={photoPreview}
                  alt="Profile preview"
                  width={150}
                  height={150}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload profile photo"
              />
              <p className="mt-2 text-sm text-muted-foreground">JPG, PNG, or WebP. Max 5MB.</p>
              {isUploadingPhoto && (
                <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

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
            />
            {errors.name && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="primary_role" className="block text-sm font-medium mb-2">
              Primary Role <span className="text-destructive">*</span>
            </label>
            <input
              id="primary_role"
              type="text"
              {...register('primary_role')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-invalid={errors.primary_role ? 'true' : 'false'}
            />
            {errors.primary_role && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.primary_role.message}
              </p>
            )}
          </div>

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
              />
              {errors.primary_location_city && (
                <p className="mt-1 text-sm text-destructive" role="alert">
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
                aria-invalid={errors.primary_location_state ? 'true' : 'false'}
              />
              {errors.primary_location_state && (
                <p className="mt-1 text-sm text-destructive" role="alert">
                  {errors.primary_location_state.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              {...register('bio')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              aria-invalid={errors.bio ? 'true' : 'false'}
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.bio.message}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              Maximum 2000 characters ({watch('bio')?.length || 0}/2000)
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

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
            />
            {errors.contact_email && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.contact_email.message}
              </p>
            )}
          </div>

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
            />
            {errors.contact_phone && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.contact_phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Professional Details */}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-xl font-semibold mb-4">Professional Details</h2>

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
            />
            {errors.years_experience && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.years_experience.message}
              </p>
            )}
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-2">Specialties/Genres</label>
            {specialtyFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <input
                  type="text"
                  {...register(`specialties.${index}`)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Specialty/Genre (e.g., Documentary, Commercial, Feature Film)"
                />
                <button
                  type="button"
                  onClick={() => removeSpecialty(index)}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendSpecialty('')}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Add Specialty/Genre
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-xl font-semibold mb-4">Links</h2>

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
            />
            {errors.portfolio_url && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.portfolio_url.message}
              </p>
            )}
          </div>

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
            />
            {errors.website && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.website.message}
              </p>
            )}
          </div>

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
            />
            {errors.instagram_url && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.instagram_url.message}
              </p>
            )}
          </div>

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
            />
            {errors.vimeo_url && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.vimeo_url.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="imdb_url" className="block text-sm font-medium mb-2">
              IMDb URL
            </label>
            <input
              id="imdb_url"
              type="url"
              {...register('imdb_url')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://www.imdb.com/name/nm..."
            />
            {errors.imdb_url && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.imdb_url.message}
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

        {/* Credits Text Field */}
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h2 className="text-xl font-semibold mb-4">Credits (Text)</h2>
          <div>
            <label htmlFor="credits" className="block text-sm font-medium mb-2">
              Credits Text
            </label>
            <textarea
              id="credits"
              rows={6}
              {...register('credits')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              placeholder="Enter credits as text..."
            />
            {errors.credits && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.credits.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-accent transition-colors text-sm"
          >
            Cancel
          </button>
        </div>

        {/* Status Messages */}
        {submitStatus.type === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800" role="alert">
            {submitStatus.message}
          </div>
        )}

        {submitStatus.type === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800" role="alert">
            {submitStatus.message}
          </div>
        )}
      </form>
    </div>
  )
}

