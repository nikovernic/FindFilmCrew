'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { VerificationEmailModal } from '@/components/profile/VerificationEmailModal'
import { createClient } from '@/lib/supabase/client'

// Helper function to normalize URLs (add https:// if missing)
const normalizeUrl = (url: string | null | undefined): string | null => {
  if (!url || url.trim() === '') return null
  const trimmed = url.trim()
  // If it already starts with http:// or https://, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  // Otherwise, add https://
  return `https://${trimmed}`
}

// Custom URL validation that accepts URLs with or without protocol
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

// Zod schema for form validation (matches API schema)
const getListedFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  department: z.enum(['camera', 'production', 'lighting', 'grip', 'art', 'sound', 'wardrobe', 'hmu']).optional().nullable(),
  primary_role: z.string().min(1, 'Primary role is required'),
  primary_location_city: z.string().min(1, 'City is required'),
  primary_location_state: z.string().length(2, 'State must be 2-letter code'),
  contact_email: z.string().email('Invalid email address'),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || val.length >= 8,
      'Password must be at least 8 characters'
    )
    .refine(
      (val) => !val || val.length === 0 || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
      'Must contain uppercase, lowercase, and a number'
    ),
  contact_phone: z.string().optional().nullable(),
  bio: z.string().max(2000, 'Bio must be 2000 characters or less').optional().nullable(),
  credits: z.string().max(2000, 'Credits must be 2000 characters or less').optional().nullable(),
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

type GetListedFormData = z.infer<typeof getListedFormSchema>

export function GetListedForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Primary role autocomplete state
  const [primaryRoleSearchTerm, setPrimaryRoleSearchTerm] = useState('')
  const [showPrimaryRoleDropdown, setShowPrimaryRoleDropdown] = useState(false)
  const [primaryRoleOptions, setPrimaryRoleOptions] = useState<string[]>([])
  const primaryRoleInputRef = useRef<HTMLInputElement>(null)
  const primaryRoleDropdownRef = useRef<HTMLDivElement>(null)

  // Secondary roles state
  const [secondaryRoleSearchTerm, setSecondaryRoleSearchTerm] = useState('')
  const [showSecondaryRoleDropdown, setShowSecondaryRoleDropdown] = useState(false)
  const [secondaryRoleOptions, setSecondaryRoleOptions] = useState<string[]>([])
  const secondaryRoleInputRef = useRef<HTMLInputElement>(null)
  const secondaryRoleDropdownRef = useRef<HTMLDivElement>(null)

  // City autocomplete state
  const [citySearchTerm, setCitySearchTerm] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [cityOptions, setCityOptions] = useState<string[]>([])
  const cityInputRef = useRef<HTMLInputElement>(null)
  const cityDropdownRef = useRef<HTMLDivElement>(null)

  // Specialties state
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState('')
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false)
  const specialtyOptions = ['Documentary', 'Commercial', 'Feature Film', 'Music Video', 'TV', 'Corporate', 'Food', 'Sports', 'Fashion', 'Reality TV', 'Live Events', 'Web Content', 'Branded Content', 'Short Film', 'Other']
  const specialtyInputRef = useRef<HTMLInputElement>(null)
  const specialtyDropdownRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<GetListedFormData>({
    resolver: zodResolver(getListedFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      department: null,
      primary_role: '',
      primary_location_city: '',
      primary_location_state: 'TX',
      contact_email: '',
      password: '',
      contact_phone: '',
      bio: '',
      credits: '',
      portfolio_url: '',
      website: '',
      instagram_url: '',
      vimeo_url: '',
      imdb_url: '',
      union_status: null,
      years_experience: null,
      secondary_roles: [],
      specialties: [],
    },
  })

  const department = watch('department')
  const primaryRole = watch('primary_role')
  const secondaryRoles = watch('secondary_roles') || []
  const specialties = watch('specialties') || []
  const city = watch('primary_location_city')

  // Check if user is already logged in
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true)
        setUserEmail(session.user.email || null)
        if (session.user.email) {
          setValue('contact_email', session.user.email)
        }
      }
    })
  }, [setValue])

  // Fetch primary role options when department changes or on mount
  useEffect(() => {
    const fetchPrimaryRoles = async () => {
      try {
        const url = department 
          ? `/api/roles?department=${department}` 
          : '/api/roles'
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setPrimaryRoleOptions(data.roles || [])
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      }
    }

    fetchPrimaryRoles()
  }, [department])

  // Fetch all roles for secondary roles (no department filter)
  useEffect(() => {
    const fetchSecondaryRoles = async () => {
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

    fetchSecondaryRoles()
  }, [])

  // Set state to TX on mount
  useEffect(() => {
    setValue('primary_location_state', 'TX')
  }, [setValue])

  // Fetch cities when search term changes
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

    const debounceTimer = setTimeout(() => {
      fetchCities()
    }, 200)

    return () => clearTimeout(debounceTimer)
  }, [citySearchTerm])

  // Refetch roles when department changes (but don't clear the role)
  // The filtering will happen in the filteredPrimaryRoles calculation

  // Filter primary role options based on search term
  const filteredPrimaryRoles = primaryRoleSearchTerm
    ? primaryRoleOptions.filter((role) =>
        role.toLowerCase().includes(primaryRoleSearchTerm.toLowerCase())
      )
    : primaryRoleOptions

  // Filter secondary role options based on search term and exclude already selected
  const filteredSecondaryRoles = secondaryRoleSearchTerm
    ? secondaryRoleOptions.filter(
        (role) =>
          role.toLowerCase().includes(secondaryRoleSearchTerm.toLowerCase()) &&
          !secondaryRoles.includes(role)
      )
    : secondaryRoleOptions.filter((role) => !secondaryRoles.includes(role))

  // Filter city options based on search term
  const filteredCities = cityOptions

  // Filter specialty options based on search term and exclude already selected
  const filteredSpecialties = specialtySearchTerm
    ? specialtyOptions.filter(
        (specialty) =>
          specialty.toLowerCase().includes(specialtySearchTerm.toLowerCase()) &&
          !specialties.includes(specialty)
      )
    : specialtyOptions.filter((specialty) => !specialties.includes(specialty))

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        primaryRoleInputRef.current &&
        !primaryRoleInputRef.current.contains(event.target as Node) &&
        primaryRoleDropdownRef.current &&
        !primaryRoleDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPrimaryRoleDropdown(false)
      }
      if (
        secondaryRoleInputRef.current &&
        !secondaryRoleInputRef.current.contains(event.target as Node) &&
        secondaryRoleDropdownRef.current &&
        !secondaryRoleDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSecondaryRoleDropdown(false)
      }
      if (
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node) &&
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false)
      }
      if (
        specialtyInputRef.current &&
        !specialtyInputRef.current.contains(event.target as Node) &&
        specialtyDropdownRef.current &&
        !specialtyDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSpecialtyDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const onSubmit = async (data: GetListedFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // Create FormData
      const formData = new FormData()

      // Add all form fields
      formData.append('name', data.name)
      if (data.department) {
        formData.append('department', data.department)
      }
      formData.append('primary_role', data.primary_role)
      formData.append('primary_location_city', data.primary_location_city)
      formData.append('primary_location_state', data.primary_location_state)
      formData.append('contact_email', data.contact_email)
      if (data.password) {
        formData.append('password', data.password)
      }
      if (data.contact_phone) {
        formData.append('contact_phone', data.contact_phone)
      }
      if (data.bio) {
        formData.append('bio', data.bio)
      }
      if (data.credits) {
        formData.append('credits', data.credits)
      }
      // Normalize URLs (add https:// if missing)
      const normalizedPortfolioUrl = normalizeUrl(data.portfolio_url)
      if (normalizedPortfolioUrl) {
        formData.append('portfolio_url', normalizedPortfolioUrl)
      }
      const normalizedWebsite = normalizeUrl(data.website)
      if (normalizedWebsite) {
        formData.append('website', normalizedWebsite)
      }
      const normalizedInstagramUrl = normalizeUrl(data.instagram_url)
      if (normalizedInstagramUrl) {
        formData.append('instagram_url', normalizedInstagramUrl)
      }
      const normalizedVimeoUrl = normalizeUrl(data.vimeo_url)
      if (normalizedVimeoUrl) {
        formData.append('vimeo_url', normalizedVimeoUrl)
      }
      const normalizedImdbUrl = normalizeUrl(data.imdb_url)
      if (normalizedImdbUrl) {
        formData.append('imdb_url', normalizedImdbUrl)
      }
      if (data.union_status) {
        formData.append('union_status', data.union_status)
      }
      if (data.years_experience) {
        formData.append('years_experience', data.years_experience.toString())
      }
      // Add secondary roles
      if (data.secondary_roles && data.secondary_roles.length > 0) {
        data.secondary_roles.forEach((role) => {
          formData.append('secondary_roles', role)
        })
      }
      // Add specialties
      if (data.specialties && data.specialties.length > 0) {
        data.specialties.forEach((specialty) => {
          formData.append('specialties', specialty)
        })
      }

      // Add photo if selected
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      // Submit to API
      const response = await fetch('/api/profiles/get-listed', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        let errorMessage = result.error?.message || 'Failed to submit profile. Please try again.'

        if (result.error?.code === 'VALIDATION_ERROR' && result.error?.details) {
          const validationErrors = result.error.details
            .map((err: any) => `${err.path.join('.')}: ${err.message}`)
            .join(', ')
          errorMessage = `Validation error: ${validationErrors}`
        }

        setSubmitStatus({ type: 'error', message: errorMessage })
        return
      }

      // Success - show message and reset form
      setSubmitStatus({
        type: 'success',
        message: result.message || "Your profile has been created and is now live on the directory!",
      })
      reset()
      setPrimaryRoleSearchTerm('')
      setSecondaryRoleSearchTerm('')
      setSpecialtySearchTerm('')
      setCitySearchTerm('')
      setPhotoFile(null)
      setPhotoPreview(null)
      // Show verification modal
      setShowVerificationModal(true)
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSecondaryRole = (role: string) => {
    const currentRoles = watch('secondary_roles') || []
    if (!currentRoles.includes(role)) {
      setValue('secondary_roles', [...currentRoles, role])
      setSecondaryRoleSearchTerm('')
      setShowSecondaryRoleDropdown(false)
    }
  }

  const removeSecondaryRole = (roleToRemove: string) => {
    const currentRoles = watch('secondary_roles') || []
    setValue(
      'secondary_roles',
      currentRoles.filter((role) => role !== roleToRemove)
    )
  }

  const addSpecialty = (specialty: string) => {
    const currentSpecialties = watch('specialties') || []
    if (!currentSpecialties.includes(specialty)) {
      setValue('specialties', [...currentSpecialties, specialty])
      setSpecialtySearchTerm('')
      setShowSpecialtyDropdown(false)
    }
  }

  const removeSpecialty = (specialtyToRemove: string) => {
    const currentSpecialties = watch('specialties') || []
    setValue(
      'specialties',
      currentSpecialties.filter((specialty) => specialty !== specialtyToRemove)
    )
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setPhotoFile(null)
      setPhotoPreview(null)
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setSubmitStatus({
        type: 'error',
        message: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.',
      })
      return
    }

    // Validate file size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setSubmitStatus({
        type: 'error',
        message: 'File size exceeds 5MB limit.',
      })
      return
    }

    setPhotoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
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
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium mb-2">
            Department (Optional)
          </label>
          <select
            id="department"
            {...register('department')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-invalid={errors.department ? 'true' : 'false'}
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
          {errors.department && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.department.message}
            </p>
          )}
        </div>

        {/* Primary Role */}
        <div className="relative" ref={primaryRoleInputRef}>
          <label htmlFor="primary_role" className="block text-sm font-medium mb-2">
            Primary Role <span className="text-destructive">*</span>
          </label>
          <input
            id="primary_role"
            type="text"
            value={primaryRoleSearchTerm}
            onChange={(e) => {
              const value = e.target.value
              setPrimaryRoleSearchTerm(value)
              // Clear the form value — user must select from dropdown
              if (primaryRole) {
                setValue('primary_role', '', { shouldValidate: false })
              }
              setShowPrimaryRoleDropdown(true)
            }}
            onFocus={() => {
              setShowPrimaryRoleDropdown(true)
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowPrimaryRoleDropdown(false)
                // If they have a valid selection, show it; otherwise clear
                if (primaryRole) {
                  setPrimaryRoleSearchTerm(primaryRole)
                } else {
                  setPrimaryRoleSearchTerm('')
                }
              }, 200)
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type to search roles..."
            aria-invalid={errors.primary_role ? 'true' : 'false'}
            autoComplete="off"
          />
          {showPrimaryRoleDropdown && filteredPrimaryRoles.length > 0 && (
            <div
              ref={primaryRoleDropdownRef}
              className="absolute z-10 w-full mt-1 bg-background border rounded max-h-60 overflow-auto"
            >
              {filteredPrimaryRoles.slice(0, 20).map((role) => (
                <button
                  key={role}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none text-sm"
                  onMouseDown={(e) => {
                    e.preventDefault() // Prevent input blur
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
          {errors.primary_role && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.primary_role.message}
            </p>
          )}
        </div>

        {/* Secondary Roles */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Secondary Roles (Optional)
          </label>
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
              <div
                ref={secondaryRoleDropdownRef}
                className="absolute z-10 w-full mt-1 bg-background border rounded max-h-60 overflow-auto"
              >
                {filteredSecondaryRoles.slice(0, 20).map((role) => (
                  <button
                    key={role}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none text-sm"
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
                <span
                  key={role}
                  className="inline-flex items-center gap-1 px-2 py-0.5 border rounded text-sm text-muted-foreground"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => removeSecondaryRole(role)}
                    className="hover:text-destructive focus:outline-none"
                    aria-label={`Remove ${role}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Specialties */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Specialties/Genres (Optional)
          </label>
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
                  const trimmedValue = specialtySearchTerm.trim()
                  if (trimmedValue && !specialties.includes(trimmedValue)) {
                    addSpecialty(trimmedValue)
                  }
                }
              }}
              onFocus={() => setShowSpecialtyDropdown(true)}
              onBlur={() => {
                setTimeout(() => {
                  setShowSpecialtyDropdown(false)
                }, 200)
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type to search suggestions or type your own and press Enter..."
              autoComplete="off"
            />
            {showSpecialtyDropdown && filteredSpecialties.length > 0 && (
              <div
                ref={specialtyDropdownRef}
                className="absolute z-10 w-full mt-1 bg-background border rounded max-h-60 overflow-auto"
              >
                {filteredSpecialties.slice(0, 20).map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none text-sm"
                    onClick={() => addSpecialty(specialty)}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Select from suggestions or type your own specialty and press Enter to add it.
          </p>
          {specialties.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="inline-flex items-center gap-1 px-2 py-0.5 border rounded text-sm text-muted-foreground"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="hover:text-destructive focus:outline-none"
                    aria-label={`Remove ${specialty}`}
                  >
                    ×
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
                const value = e.target.value
                setCitySearchTerm(value)
                setValue('primary_location_city', value, { shouldValidate: false })
                setShowCityDropdown(true)
              }}
              onFocus={() => {
                if (!city) {
                  setCitySearchTerm('')
                }
                setShowCityDropdown(true)
              }}
              onBlur={() => {
                setTimeout(() => {
                  setShowCityDropdown(false)
                  if (city) {
                    setCitySearchTerm(city)
                  } else {
                    setCitySearchTerm('')
                  }
                }, 200)
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type to search cities..."
              aria-invalid={errors.primary_location_city ? 'true' : 'false'}
              autoComplete="off"
            />
            {showCityDropdown && filteredCities.length > 0 && (
              <div
                ref={cityDropdownRef}
                className="absolute z-10 w-full mt-1 bg-background border rounded max-h-60 overflow-auto"
              >
                {filteredCities.slice(0, 20).map((cityOption) => (
                  <button
                    key={cityOption}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none text-sm"
                    onClick={() => {
                      setValue('primary_location_city', cityOption)
                      setCitySearchTerm(cityOption)
                      setShowCityDropdown(false)
                    }}
                  >
                    {cityOption}
                  </button>
                ))}
              </div>
            )}
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
              value="TX"
              readOnly
              {...register('primary_location_state')}
              className="w-full px-3 py-2 border rounded bg-muted cursor-not-allowed uppercase text-sm"
              aria-invalid={errors.primary_location_state ? 'true' : 'false'}
            />
            {errors.primary_location_state && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.primary_location_state.message}
              </p>
            )}
          </div>
        </div>

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
          />
          {errors.contact_email && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.contact_email.message}
            </p>
          )}
        </div>

        {/* Password - hidden if already logged in */}
        {!isLoggedIn && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Create Password <span className="text-destructive">*</span>
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-invalid={errors.password ? 'true' : 'false'}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              This creates your account so you can sign in and edit your profile later.
            </p>
            {errors.password && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>
        )}

        {/* Contact Phone */}
        <div>
          <label htmlFor="contact_phone" className="block text-sm font-medium mb-2">
            Contact Phone (Optional)
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

        {/* Photo Upload */}
        <div>
          <label htmlFor="photo" className="block text-sm font-medium mb-2">
            Profile Photo (Optional)
          </label>
          {photoPreview && (
            <div className="mb-3">
              <img
                src={photoPreview}
                alt="Profile preview"
                className="w-32 h-32 object-cover rounded-md border"
              />
            </div>
          )}
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            aria-label="Upload profile photo"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            JPG, PNG, or WebP. Max 5MB.
          </p>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            Bio (Optional, max 2000 characters)
          </label>
          <textarea
            id="bio"
            rows={4}
            {...register('bio')}
            placeholder="Bios help crew book more gigs! Get creative, tell us what your specialty is, your experience, and what you're like on set!"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-invalid={errors.bio ? 'true' : 'false'}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Bios help crew book more gigs! Get creative, tell us what your specialty is, your experience, and what you're like on set!
          </p>
          {errors.bio && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.bio.message}
            </p>
          )}
        </div>

        {/* Credits */}
        <div>
          <label htmlFor="credits" className="block text-sm font-medium mb-2">
            Credits (Optional, max 2000 characters)
          </label>
          <textarea
            id="credits"
            rows={6}
            {...register('credits')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            placeholder="List your notable credits, projects, or work experience..."
            aria-invalid={errors.credits ? 'true' : 'false'}
          />
          {errors.credits && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.credits.message}
            </p>
          )}
        </div>

        {/* Portfolio URL */}
        <div>
          <label htmlFor="portfolio_url" className="block text-sm font-medium mb-2">
            Portfolio/Reel URL (Optional)
          </label>
          <input
            id="portfolio_url"
            type="text"
            {...register('portfolio_url')}
            placeholder="example.com or https://example.com"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-invalid={errors.portfolio_url ? 'true' : 'false'}
          />
          {errors.portfolio_url && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.portfolio_url.message}
            </p>
          )}
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-2">
            Website (Optional)
          </label>
          <input
            id="website"
            type="text"
            {...register('website')}
            placeholder="example.com or https://example.com"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-invalid={errors.website ? 'true' : 'false'}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.website.message}
            </p>
          )}
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="instagram_url" className="block text-sm font-medium mb-2">
              Instagram URL (Optional)
            </label>
            <input
              id="instagram_url"
              type="text"
              {...register('instagram_url')}
              placeholder="instagram.com/username"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-invalid={errors.instagram_url ? 'true' : 'false'}
            />
            {errors.instagram_url && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.instagram_url.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="vimeo_url" className="block text-sm font-medium mb-2">
              Vimeo URL (Optional)
            </label>
            <input
              id="vimeo_url"
              type="text"
              {...register('vimeo_url')}
              placeholder="vimeo.com/username"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-invalid={errors.vimeo_url ? 'true' : 'false'}
            />
            {errors.vimeo_url && (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.vimeo_url.message}
              </p>
            )}
          </div>
        </div>

        {/* IMDB URL */}
        <div>
          <label htmlFor="imdb_url" className="block text-sm font-medium mb-2">
            IMDB URL (Optional)
          </label>
          <input
            id="imdb_url"
            type="text"
            {...register('imdb_url')}
            placeholder="imdb.com/name/nm1234567"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-invalid={errors.imdb_url ? 'true' : 'false'}
          />
          {errors.imdb_url && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.imdb_url.message}
            </p>
          )}
        </div>

        {/* Union Status */}
        <div>
          <label htmlFor="union_status" className="block text-sm font-medium mb-2">
            Union Status (Optional)
          </label>
          <select
            id="union_status"
            {...register('union_status')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-invalid={errors.union_status ? 'true' : 'false'}
          >
            <option value="">Select...</option>
            <option value="union">Union</option>
            <option value="non-union">Non-Union</option>
            <option value="either">Either</option>
          </select>
          {errors.union_status && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {errors.union_status.message}
            </p>
          )}
        </div>

        {/* Years Experience */}
        <div>
          <label htmlFor="years_experience" className="block text-sm font-medium mb-2">
            Years of Experience (Optional)
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

      {/* Verification Email Modal */}
      <VerificationEmailModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      />
    </div>
  )
}
