'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Profile } from '@crew-up/shared'

const normalizeUrl = (url: string | null | undefined): string | null => {
  if (!url || url.trim() === '') return null
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  return `https://${trimmed}`
}

const urlSchema = z
  .string()
  .optional()
  .nullable()
  .or(z.literal(''))
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true
      const normalized = normalizeUrl(val)
      if (!normalized) return true
      try {
        new URL(normalized)
        return true
      } catch {
        return false
      }
    },
    { message: 'Invalid URL format' }
  )

const profileEditFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  department: z.enum(['camera', 'production', 'lighting', 'grip', 'art', 'sound', 'wardrobe', 'hmu']).optional().nullable(),
  primary_role: z.string().min(1, 'Primary role is required'),
  primary_location_city: z.string().min(1, 'City is required'),
  primary_location_state: z.string().length(2, 'State must be 2-letter code'),
  contact_email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  contact_phone: z.string().optional().nullable(),
  bio: z.string().max(2000, 'Bio must be 2000 characters or less').optional().nullable(),
  portfolio_url: urlSchema,
  website: urlSchema,
  instagram_url: urlSchema,
  vimeo_url: urlSchema,
  imdb_url: urlSchema,
  union_status: z.enum(['union', 'non-union', 'either']).optional().nullable(),
  years_experience: z.number().int().positive().optional().nullable(),
  secondary_roles: z.array(z.string()).optional().nullable(),
  specialties: z.array(z.string()).optional().nullable(),
})

type ProfileEditFormData = z.infer<typeof profileEditFormSchema>

interface ProfileEditFormProps {
  profile: Profile
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photo_url)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // Primary role autocomplete
  const [primaryRoleSearchTerm, setPrimaryRoleSearchTerm] = useState(profile.primary_role || '')
  const [showPrimaryRoleDropdown, setShowPrimaryRoleDropdown] = useState(false)
  const [primaryRoleOptions, setPrimaryRoleOptions] = useState<string[]>([])
  const primaryRoleInputRef = useRef<HTMLDivElement>(null)
  const primaryRoleDropdownRef = useRef<HTMLDivElement>(null)

  // Secondary roles
  const [secondaryRoleSearchTerm, setSecondaryRoleSearchTerm] = useState('')
  const [showSecondaryRoleDropdown, setShowSecondaryRoleDropdown] = useState(false)
  const [secondaryRoleOptions, setSecondaryRoleOptions] = useState<string[]>([])
  const secondaryRoleInputRef = useRef<HTMLDivElement>(null)
  const secondaryRoleDropdownRef = useRef<HTMLDivElement>(null)

  // City autocomplete
  const [citySearchTerm, setCitySearchTerm] = useState(profile.primary_location_city || '')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [cityOptions, setCityOptions] = useState<string[]>([])
  const cityInputRef = useRef<HTMLDivElement>(null)
  const cityDropdownRef = useRef<HTMLDivElement>(null)

  // Specialties
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState('')
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)
  const specialtyOptions = ['Documentary', 'Commercial', 'Feature Film', 'Music Video', 'TV', 'Corporate', 'Food', 'Sports', 'Fashion', 'Reality TV', 'Live Events', 'Web Content', 'Branded Content', 'Short Film', 'Other']
  const specialtyInputRef = useRef<HTMLDivElement>(null)
  const specialtyDropdownRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: profile.name,
      department: (profile as any).department || null,
      primary_role: profile.primary_role,
      primary_location_city: profile.primary_location_city,
      primary_location_state: profile.primary_location_state,
      contact_email: profile.contact_email || '',
      contact_phone: profile.contact_phone || '',
      bio: profile.bio || '',
      portfolio_url: profile.portfolio_url || '',
      website: profile.website || '',
      instagram_url: profile.instagram_url || '',
      vimeo_url: profile.vimeo_url || '',
      imdb_url: (profile as any).imdb_url || '',
      union_status: profile.union_status,
      years_experience: profile.years_experience,
      secondary_roles: profile.secondary_roles || [],
      specialties: (profile as any).specialties || [],
    },
  })

  const department = watch('department')
  const primaryRole = watch('primary_role')
  const secondaryRoles = watch('secondary_roles') || []
  const specialties = watch('specialties') || []
  const city = watch('primary_location_city')

  // Fetch primary role options
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const url = department ? `/api/roles?department=${department}` : '/api/roles'
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setPrimaryRoleOptions(data.roles || [])
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    }
    fetchRoles()
  }, [department])

  // Fetch secondary role options
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/roles')
        if (response.ok) {
          const data = await response.json()
          setSecondaryRoleOptions(data.roles || [])
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    }
    fetchRoles()
  }, [])

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      if (citySearchTerm.length < 1) {
        setCityOptions([])
        return
      }
      try {
        const response = await fetch(`/api/cities?q=${encodeURIComponent(citySearchTerm)}&state=TX`)
        if (response.ok) {
          const data = await response.json()
          setCityOptions(data.cities || [])
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error)
      }
    }
    const timer = setTimeout(fetchCities, 200)
    return () => clearTimeout(timer)
  }, [citySearchTerm])

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (primaryRoleInputRef.current && !primaryRoleInputRef.current.contains(target)) {
        setShowPrimaryRoleDropdown(false)
      }
      if (secondaryRoleInputRef.current && !secondaryRoleInputRef.current.contains(target)) {
        setShowSecondaryRoleDropdown(false)
      }
      if (cityInputRef.current && !cityInputRef.current.contains(target)) {
        setShowCityDropdown(false)
      }
      if (specialtyInputRef.current && !specialtyInputRef.current.contains(target)) {
        setShowSpecialtyDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredPrimaryRoles = primaryRoleSearchTerm
    ? primaryRoleOptions.filter((r) => r.toLowerCase().includes(primaryRoleSearchTerm.toLowerCase()))
    : primaryRoleOptions

  const filteredSecondaryRoles = secondaryRoleSearchTerm
    ? secondaryRoleOptions.filter((r) => r.toLowerCase().includes(secondaryRoleSearchTerm.toLowerCase()) && !secondaryRoles.includes(r))
    : secondaryRoleOptions.filter((r) => !secondaryRoles.includes(r))

  const filteredSpecialties = specialtySearchTerm
    ? specialtyOptions.filter((s) => s.toLowerCase().includes(specialtySearchTerm.toLowerCase()) && !specialties.includes(s))
    : specialtyOptions.filter((s) => !specialties.includes(s))

  const addSecondaryRole = (role: string) => {
    if (!secondaryRoles.includes(role)) {
      setValue('secondary_roles', [...secondaryRoles, role])
      setSecondaryRoleSearchTerm('')
      setShowSecondaryRoleDropdown(false)
    }
  }

  const removeSecondaryRole = (roleToRemove: string) => {
    setValue('secondary_roles', secondaryRoles.filter((r) => r !== roleToRemove))
  }

  const addSpecialty = (specialty: string) => {
    if (!specialties.includes(specialty)) {
      setValue('specialties', [...specialties, specialty])
      setSpecialtySearchTerm('')
      setShowSpecialtyDropdown(false)
    }
  }

  const removeSpecialty = (specialtyToRemove: string) => {
    setValue('specialties', specialties.filter((s) => s !== specialtyToRemove))
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setSubmitStatus({ type: 'error', message: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitStatus({ type: 'error', message: 'File size exceeds 5MB limit.' })
      return
    }

    setIsUploadingPhoto(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)

      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch('/api/profiles/me/photo', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok) {
        setSubmitStatus({ type: 'error', message: result.error?.message || 'Failed to upload photo.' })
        return
      }

      setSubmitStatus({ type: 'success', message: 'Photo uploaded!' })
    } catch {
      setSubmitStatus({ type: 'error', message: 'Failed to upload photo.' })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const onSubmit = async (data: ProfileEditFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const cleanedData = {
        name: data.name,
        primary_role: data.primary_role,
        primary_location_city: data.primary_location_city,
        primary_location_state: data.primary_location_state,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        bio: data.bio || null,
        portfolio_url: normalizeUrl(data.portfolio_url),
        website: normalizeUrl(data.website),
        instagram_url: normalizeUrl(data.instagram_url),
        vimeo_url: normalizeUrl(data.vimeo_url),
        imdb_url: normalizeUrl(data.imdb_url),
        union_status: data.union_status || null,
        years_experience: data.years_experience || null,
        secondary_roles: data.secondary_roles && data.secondary_roles.length > 0 ? data.secondary_roles : null,
        specialties: data.specialties && data.specialties.length > 0 ? data.specialties : null,
      }

      const response = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) {
        const result = await response.json()
        setSubmitStatus({ type: 'error', message: result.error?.message || 'Failed to update profile.' })
        return
      }

      setSubmitStatus({ type: 'success', message: 'Profile updated!' })
    } catch {
      setSubmitStatus({ type: 'error', message: 'An error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Photo */}
        <div>
          <label className="block text-sm font-medium mb-2">Profile Photo</label>
          <div className="flex items-start gap-4">
            {photoPreview && (
              <img src={photoPreview} alt="Profile" className="w-24 h-24 rounded-lg object-cover border" />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WebP. Max 5MB.</p>
              {isUploadingPhoto && <p className="mt-1 text-xs text-muted-foreground">Uploading...</p>}
            </div>
          </div>
        </div>

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
          />
          {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium mb-2">Department (Optional)</label>
          <select
            id="department"
            {...register('department')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select department (optional)</option>
            <option value="production">Production</option>
            <option value="camera">Camera</option>
            <option value="lighting">Lighting</option>
            <option value="grip">Grip</option>
            <option value="sound">Sound</option>
            <option value="art">Art</option>
            <option value="wardrobe">Wardrobe</option>
            <option value="hmu">HMU</option>
          </select>
        </div>

        {/* Primary Role - Dropdown only */}
        <div className="relative" ref={primaryRoleInputRef}>
          <label htmlFor="primary_role" className="block text-sm font-medium mb-2">
            Primary Role <span className="text-destructive">*</span>
          </label>
          <input
            id="primary_role"
            type="text"
            value={primaryRoleSearchTerm}
            onChange={(e) => {
              setPrimaryRoleSearchTerm(e.target.value)
              if (primaryRole) setValue('primary_role', '', { shouldValidate: false })
              setShowPrimaryRoleDropdown(true)
            }}
            onFocus={() => setShowPrimaryRoleDropdown(true)}
            onBlur={() => {
              setTimeout(() => {
                setShowPrimaryRoleDropdown(false)
                if (primaryRole) setPrimaryRoleSearchTerm(primaryRole)
                else setPrimaryRoleSearchTerm('')
              }, 200)
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type to search roles..."
            autoComplete="off"
          />
          {showPrimaryRoleDropdown && filteredPrimaryRoles.length > 0 && (
            <div ref={primaryRoleDropdownRef} className="absolute z-10 w-full mt-1 bg-background border rounded max-h-60 overflow-auto">
              {filteredPrimaryRoles.slice(0, 20).map((role) => (
                <button
                  key={role}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-accent text-sm"
                  onClick={() => {
                    setValue('primary_role', role)
                    setPrimaryRoleSearchTerm(role)
                    setShowPrimaryRoleDropdown(false)
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
          {errors.primary_role && <p className="mt-1 text-sm text-destructive">{errors.primary_role.message}</p>}
        </div>

        {/* Secondary Roles - Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2">Secondary Roles (Optional)</label>
          <div className="relative" ref={secondaryRoleInputRef}>
            <input
              type="text"
              value={secondaryRoleSearchTerm}
              onChange={(e) => {
                setSecondaryRoleSearchTerm(e.target.value)
                setShowSecondaryRoleDropdown(true)
              }}
              onFocus={() => setShowSecondaryRoleDropdown(true)}
              onBlur={() => {
                setTimeout(() => {
                  setShowSecondaryRoleDropdown(false)
                  setSecondaryRoleSearchTerm('')
                }, 200)
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type to search and add roles..."
              autoComplete="off"
            />
            {showSecondaryRoleDropdown && filteredSecondaryRoles.length > 0 && (
              <div ref={secondaryRoleDropdownRef} className="absolute z-10 w-full mt-1 bg-background border rounded max-h-60 overflow-auto">
                {filteredSecondaryRoles.slice(0, 20).map((role) => (
                  <button
                    key={role}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-accent text-sm"
                    onClick={() => addSecondaryRole(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
          {secondaryRoles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {secondaryRoles.map((role) => (
                <span key={role} className="inline-flex items-center gap-1 px-2 py-0.5 border rounded text-sm text-muted-foreground">
                  {role}
                  <button type="button" onClick={() => removeSecondaryRole(role)} className="hover:text-destructive" aria-label={`Remove ${role}`}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Specialties */}
        <div>
          <label className="block text-sm font-medium mb-2">Specialties/Genres (Optional)</label>
          <div className="relative" ref={specialtyInputRef}>
            <input
              type="text"
              value={specialtySearchTerm}
              onChange={(e) => {
                setSpecialtySearchTerm(e.target.value)
                setShowSpecialtyDropdown(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const trimmed = specialtySearchTerm.trim()
                  if (trimmed && !specialties.includes(trimmed)) addSpecialty(trimmed)
                }
              }}
              onFocus={() => setShowSpecialtyDropdown(true)}
              onBlur={() => setTimeout(() => setShowSpecialtyDropdown(false), 200)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type to search or add your own..."
              autoComplete="off"
            />
            {showSpecialtyDropdown && filteredSpecialties.length > 0 && (
              <div ref={specialtyDropdownRef} className="absolute z-10 w-full mt-1 bg-background border rounded max-h-60 overflow-auto">
                {filteredSpecialties.slice(0, 20).map((s) => (
                  <button key={s} type="button" className="w-full text-left px-4 py-2 hover:bg-accent text-sm" onClick={() => addSpecialty(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          {specialties.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {specialties.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 border rounded text-sm text-muted-foreground">
                  {s}
                  <button type="button" onClick={() => removeSpecialty(s)} className="hover:text-destructive" aria-label={`Remove ${s}`}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative" ref={cityInputRef}>
            <label htmlFor="primary_location_city" className="block text-sm font-medium mb-2">
              City <span className="text-destructive">*</span>
            </label>
            <input
              id="primary_location_city"
              type="text"
              value={city || citySearchTerm}
              onChange={(e) => {
                setCitySearchTerm(e.target.value)
                setValue('primary_location_city', e.target.value, { shouldValidate: false })
                setShowCityDropdown(true)
              }}
              onFocus={() => setShowCityDropdown(true)}
              onBlur={() => {
                setTimeout(() => {
                  setShowCityDropdown(false)
                  if (city) setCitySearchTerm(city)
                  else setCitySearchTerm('')
                }, 200)
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type to search cities..."
              autoComplete="off"
            />
            {showCityDropdown && cityOptions.length > 0 && (
              <div ref={cityDropdownRef} className="absolute z-10 w-full mt-1 bg-background border rounded max-h-60 overflow-auto">
                {cityOptions.slice(0, 20).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-accent text-sm"
                    onClick={() => {
                      setValue('primary_location_city', c)
                      setCitySearchTerm(c)
                      setShowCityDropdown(false)
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {errors.primary_location_city && <p className="mt-1 text-sm text-destructive">{errors.primary_location_city.message}</p>}
          </div>
          <div>
            <label htmlFor="primary_location_state" className="block text-sm font-medium mb-2">
              State <span className="text-destructive">*</span>
            </label>
            <input
              id="primary_location_state"
              type="text"
              value="TX"
              readOnly
              {...register('primary_location_state')}
              className="w-full px-3 py-2 border rounded bg-muted cursor-not-allowed uppercase text-sm"
            />
          </div>
        </div>

        {/* Contact Email */}
        <div>
          <label htmlFor="contact_email" className="block text-sm font-medium mb-2">Contact Email</label>
          <input
            id="contact_email"
            type="email"
            {...register('contact_email')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.contact_email && <p className="mt-1 text-sm text-destructive">{errors.contact_email.message}</p>}
        </div>

        {/* Contact Phone */}
        <div>
          <label htmlFor="contact_phone" className="block text-sm font-medium mb-2">Contact Phone (Optional)</label>
          <input
            id="contact_phone"
            type="tel"
            {...register('contact_phone')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">Bio (Optional)</label>
          <textarea
            id="bio"
            rows={4}
            {...register('bio')}
            placeholder="Tell us about yourself, your specialty, experience, and what you're like on set!"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          />
          <p className="mt-1 text-xs text-muted-foreground">{watch('bio')?.length || 0}/2000 characters</p>
          {errors.bio && <p className="mt-1 text-sm text-destructive">{errors.bio.message}</p>}
        </div>

        {/* Portfolio URL */}
        <div>
          <label htmlFor="portfolio_url" className="block text-sm font-medium mb-2">Portfolio/Reel URL (Optional)</label>
          <input
            id="portfolio_url"
            type="text"
            {...register('portfolio_url')}
            placeholder="example.com or https://example.com"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.portfolio_url && <p className="mt-1 text-sm text-destructive">{errors.portfolio_url.message}</p>}
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-2">Website (Optional)</label>
          <input
            id="website"
            type="text"
            {...register('website')}
            placeholder="example.com or https://example.com"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.website && <p className="mt-1 text-sm text-destructive">{errors.website.message}</p>}
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="instagram_url" className="block text-sm font-medium mb-2">Instagram (Optional)</label>
            <input
              id="instagram_url"
              type="text"
              {...register('instagram_url')}
              placeholder="instagram.com/username"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.instagram_url && <p className="mt-1 text-sm text-destructive">{errors.instagram_url.message}</p>}
          </div>
          <div>
            <label htmlFor="vimeo_url" className="block text-sm font-medium mb-2">Vimeo (Optional)</label>
            <input
              id="vimeo_url"
              type="text"
              {...register('vimeo_url')}
              placeholder="vimeo.com/username"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.vimeo_url && <p className="mt-1 text-sm text-destructive">{errors.vimeo_url.message}</p>}
          </div>
        </div>

        {/* IMDB URL */}
        <div>
          <label htmlFor="imdb_url" className="block text-sm font-medium mb-2">IMDB (Optional)</label>
          <input
            id="imdb_url"
            type="text"
            {...register('imdb_url')}
            placeholder="imdb.com/name/nm1234567"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.imdb_url && <p className="mt-1 text-sm text-destructive">{errors.imdb_url.message}</p>}
        </div>

        {/* Union Status */}
        <div>
          <label htmlFor="union_status" className="block text-sm font-medium mb-2">Union Status (Optional)</label>
          <select
            id="union_status"
            {...register('union_status')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select...</option>
            <option value="union">Union</option>
            <option value="non-union">Non-Union</option>
            <option value="either">Either</option>
          </select>
        </div>

        {/* Years Experience */}
        <div>
          <label htmlFor="years_experience" className="block text-sm font-medium mb-2">Years of Experience (Optional)</label>
          <input
            id="years_experience"
            type="number"
            min="0"
            {...register('years_experience', { valueAsNumber: true })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.years_experience && <p className="mt-1 text-sm text-destructive">{errors.years_experience.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2.5 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Status Messages */}
        {submitStatus.type === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">{submitStatus.message}</div>
        )}
        {submitStatus.type === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">{submitStatus.message}</div>
        )}
      </form>
    </div>
  )
}
