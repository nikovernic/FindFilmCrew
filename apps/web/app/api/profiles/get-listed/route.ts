import { NextRequest, NextResponse } from 'next/server'
import { profileService } from '@/lib/services/profileService'
import { handleError } from '@/lib/utils/errorHandler'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'))
}

function isValidImageType(mimeType: string, filename: string): boolean {
  const extension = getFileExtension(filename)
  return (
    ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase()) &&
    ALLOWED_EXTENSIONS.includes(extension)
  )
}

// Zod schema for profile creation
const getListedSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  primary_role: z.string().min(1, 'Primary role is required'),
  primary_location_city: z.string().min(1, 'City is required'),
  primary_location_state: z.string().length(2, 'State must be 2-letter code'),
  contact_email: z.string().email('Invalid email address'),
  department: z.enum(['camera', 'production', 'lighting', 'grip', 'art', 'sound', 'wardrobe', 'hmu']).optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  bio: z.string().max(2000, 'Bio must be 2000 characters or less').optional().nullable(),
  credits: z.string().max(2000, 'Credits must be 2000 characters or less').optional().nullable(),
  portfolio_url: z.string().url().optional().nullable().or(z.literal('')),
  website: z.string().url().optional().nullable().or(z.literal('')),
  instagram_url: z.string().url().optional().nullable().or(z.literal('')),
  vimeo_url: z.string().url().optional().nullable().or(z.literal('')),
  imdb_url: z.string().url().optional().nullable().or(z.literal('')),
  union_status: z.enum(['union', 'non-union', 'either']).optional().nullable(),
  years_experience: z.number().int().positive().optional().nullable(),
  secondary_roles: z.array(z.string()).optional().nullable(),
  specialties: z.array(z.string()).optional().nullable(),
  additional_markets: z
    .array(
      z.object({
        city: z.string(),
        state: z.string().length(2),
      })
    )
    .optional()
    .nullable(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData()
    
    // Handle photo upload first (if provided)
    const photoFile = formData.get('photo') as File | null
    let photoUrl: string | null = null

    if (photoFile) {
      // Validate file size
      if (photoFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'File size exceeds 5MB limit',
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
            },
          },
          { status: 400 }
        )
      }

      // Validate file type
      if (!isValidImageType(photoFile.type, photoFile.name)) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid file type. Only JPG, PNG, and WebP images are allowed',
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
            },
          },
          { status: 400 }
        )
      }

      // Validate image integrity by reading first bytes
      const arrayBuffer = await photoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const isValidImage =
        (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) || // JPEG
        (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) || // PNG
        (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) // WebP (RIFF)

      if (!isValidImage) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'File is not a valid image',
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
            },
          },
          { status: 400 }
        )
      }

      // Upload to Supabase Storage
      const supabase = createClient()
      const fileExt = getFileExtension(photoFile.name)
      const tempId = crypto.randomUUID()
      const fileName = `${tempId}/${crypto.randomUUID()}${fileExt}`
      const filePath = `profiles/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, arrayBuffer, {
          contentType: photoFile.type,
          upsert: false,
        })

      if (uploadError) {
        // Log error but don't fail profile creation - photo is optional
        console.error('Photo upload failed:', uploadError.message)
        
        // If bucket doesn't exist, provide helpful error message
        if (uploadError.message.includes('Bucket not found')) {
          console.error(
            'Storage bucket "profile-photos" not found. ' +
            'Please create it in Supabase Dashboard: Storage → New Bucket → Name: "profile-photos" → Public: Yes'
          )
        }
        
        // Continue without photo - profile will be created without photo_url
        photoUrl = null
      } else {
        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('profile-photos').getPublicUrl(filePath)

        photoUrl = publicUrl
      }
    }
    
    // Extract profile data from form
    const profileData: Record<string, unknown> = {}
    
    // Handle secondary_roles array first (use getAll to get all values)
    const secondaryRoles = formData.getAll('secondary_roles')
      .map(v => v.toString())
      .filter(v => v.trim() !== '')
    
    if (secondaryRoles.length > 0) {
      profileData.secondary_roles = secondaryRoles
    }
    
    // Handle specialties array
    const specialties = formData.getAll('specialties')
      .map(v => v.toString())
      .filter(v => v.trim() !== '')
    
    if (specialties.length > 0) {
      profileData.specialties = specialties
    }
    
    // Handle other fields
    for (const [key, value] of formData.entries()) {
      // Skip fields we handle separately
      if (key === 'secondary_roles' || key === 'specialties' || key === 'photo' || key === 'password') continue
      
      const stringValue = value.toString()
      
      // Handle numeric fields
      if (key === 'years_experience') {
        profileData[key] = stringValue ? parseInt(stringValue, 10) : null
      } 
      // Handle optional string fields (convert empty strings to null)
      else if (
        key === 'contact_phone' ||
        key === 'bio' ||
        key === 'credits' ||
        key === 'portfolio_url' ||
        key === 'website' ||
        key === 'instagram_url' ||
        key === 'vimeo_url' ||
        key === 'imdb_url' ||
        key === 'union_status' ||
        key === 'department'
      ) {
        profileData[key] = stringValue || null
      } 
      // Handle required string fields
      else {
        profileData[key] = stringValue
      }
    }

    // Parse and validate profile data
    const validatedData = getListedSchema.parse(profileData)

    // Check if user is already authenticated (logged-in user creating a profile)
    const supabase = createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Create auth account if password provided, or link to existing session
    const password = formData.get('password')?.toString()
    let userId: string | null = null

    if (currentUser) {
      // User is logged in — ensure they exist in public.users table
      const supabaseAdmin = createAdminClient()
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', currentUser.id)
        .single()

      if (existingUser) {
        userId = currentUser.id
      } else {
        // Create the public.users record
        const { error: userError } = await supabaseAdmin.from('users').insert({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.user_metadata?.role === 'crew' ? 'crew' : 'crew',
        })
        if (!userError) {
          userId = currentUser.id
        } else {
          console.error('Failed to create user record for logged-in user:', userError.message)
        }
      }
    } else if (password && validatedData.contact_email) {
      const supabaseAdmin = createAdminClient()
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: validatedData.contact_email,
        password,
        email_confirm: true,
        user_metadata: {
          name: validatedData.name,
          role: 'crew',
        },
      })

      if (authError) {
        // If email already exists, return friendly error
        if (authError.message.includes('already') || authError.message.includes('exists')) {
          return NextResponse.json(
            {
              error: {
                code: 'EMAIL_ALREADY_EXISTS',
                message: 'An account with this email already exists. Please sign in and create your profile from your account.',
              },
            },
            { status: 409 }
          )
        }
        console.error('Auth account creation failed:', authError.message)
        // Continue without account — profile still gets created
      } else if (authData.user) {
        userId = authData.user.id

        // Create user record in users table (required by foreign key)
        const { error: userError } = await supabaseAdmin.from('users').insert({
          id: userId,
          email: validatedData.contact_email,
          role: 'crew',
        })

        if (userError) {
          console.error('Failed to create user record:', userError.message)
          // If user record fails, don't link profile to avoid FK violation
          userId = null
        }
      }
    }

    // Create profile with approved status (immediately live)
    const createData: Record<string, unknown> = {
      ...validatedData,
      photo_url: photoUrl || null,
      profile_status: 'approved' as const,
    }
    // Only include user_id if we have a valid one (avoids FK constraint violation)
    if (userId) {
      createData.user_id = userId
    }
    // Ensure no null/undefined user_id slips through
    if (!createData.user_id) {
      delete createData.user_id
    }
    console.log('Creating profile with user_id:', createData.user_id || '(none)')
    const profile = await profileService.createProfile(createData as any)

    return NextResponse.json(
      {
        message: userId
          ? "Your profile and account have been created! You can now sign in to edit your profile."
          : "Your profile has been created and is now live on the directory!",
        profile: {
          id: profile.id,
          slug: profile.slug,
          status: profile.profile_status || 'approved',
        },
        accountCreated: !!userId,
      },
      { status: 201 }
    )
  } catch (error) {
    return handleError(error)
  }
}

