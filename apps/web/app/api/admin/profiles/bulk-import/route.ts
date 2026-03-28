import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware/auth'
import { profileService } from '@/lib/services/profileService'
import { handleError } from '@/lib/utils/errorHandler'
import { parseCSV, validateCSVRow, csvRowToProfileData } from '@/lib/utils/csvParser'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_ROWS = 1000

interface ImportResult {
  total: number
  successful: number
  failed: number
  photosUploaded: number
  errors: Array<{ row: number; message: string }>
}

/**
 * Download an image from a URL and upload it to Supabase Storage.
 * Returns the public URL on success, or null on failure.
 */
async function uploadPhotoFromUrl(
  profileId: string,
  photoUrl: string
): Promise<string | null> {
  try {
    const response = await fetch(photoUrl, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) return null

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()

    // Skip if too large (5MB)
    if (buffer.byteLength > 5 * 1024 * 1024) return null

    // Determine extension from content type
    const extMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    }
    const ext = extMap[contentType] || '.jpg'
    const filePath = `profiles/${profileId}/${crypto.randomUUID()}${ext}`

    const supabase = createAdminClient()
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, buffer, {
        contentType,
        upsert: false,
      })

    if (uploadError) return null

    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-photos').getPublicUrl(filePath)

    return publicUrl
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request)
    if (auth instanceof NextResponse) return auth

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'CSV file is required',
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File must be a CSV file',
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      )
    }

    // Read file content
    const csvContent = await file.text()

    // Parse CSV
    const parseResult = parseCSV(csvContent)

    // Check row limit
    if (parseResult.data.length > MAX_ROWS) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: `CSV file contains more than ${MAX_ROWS} rows. Maximum allowed: ${MAX_ROWS}`,
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      )
    }

    // Process each row
    const result: ImportResult = {
      total: parseResult.data.length,
      successful: 0,
      failed: 0,
      photosUploaded: 0,
      errors: [...parseResult.errors],
    }

    // Process rows in batches to avoid overwhelming the database
    const BATCH_SIZE = 10
    for (let i = 0; i < parseResult.data.length; i += BATCH_SIZE) {
      const batch = parseResult.data.slice(i, i + BATCH_SIZE)

      for (let j = 0; j < batch.length; j++) {
        const row = batch[j]
        const rowNumber = i + j + 1

        // Validate row
        const validation = validateCSVRow(row, rowNumber)
        if (!validation.isValid) {
          result.errors.push(...validation.errors)
          result.failed++
          continue
        }

        // Convert to profile data
        try {
          const profileData = csvRowToProfileData(row)

          // Create profile using createPendingProfile
          const profile = await profileService.createPendingProfile(profileData)
          result.successful++

          // If CSV row has a photo_url, download and upload it
          if (row.photo_url && row.photo_url.trim() !== '') {
            const publicPhotoUrl = await uploadPhotoFromUrl(
              profile.id,
              row.photo_url.trim()
            )
            if (publicPhotoUrl) {
              await profileService.updateProfileAsAdmin(profile.id, {
                photo_url: publicPhotoUrl,
              })
              result.photosUploaded++
            }
          }
        } catch (error) {
          result.failed++
          result.errors.push({
            row: rowNumber,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to create profile',
          })
        }
      }
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}

