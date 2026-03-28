import Papa from 'papaparse'
import type { CreateProfileData } from '@/lib/services/profileService'

export interface CSVRow {
  name: string
  primary_role: string
  primary_location_city: string
  primary_location_state: string
  contact_email?: string
  contact_phone?: string
  bio?: string
  portfolio_url?: string
  website?: string
  instagram_url?: string
  vimeo_url?: string
  union_status?: string
  years_experience?: string
  secondary_roles?: string
  specialties?: string
  additional_markets?: string
  photo_url?: string
}

export interface CSVParseResult {
  data: CSVRow[]
  errors: Array<{ row: number; message: string }>
}

export interface CSVValidationResult {
  isValid: boolean
  errors: Array<{ row: number; message: string }>
}

/**
 * Parse CSV file content into rows
 */
export function parseCSV(csvContent: string): CSVParseResult {
  const errors: Array<{ row: number; message: string }> = []

  const parseResult = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      // Normalize header names (trim, lowercase, replace spaces with underscores)
      return header.trim().toLowerCase().replace(/\s+/g, '_')
    },
    transform: (value) => {
      // Trim whitespace from values
      return typeof value === 'string' ? value.trim() : value
    },
  })

  // Convert Papa errors to our format
  if (parseResult.errors.length > 0) {
    parseResult.errors.forEach((error) => {
      errors.push({
        row: error.row !== undefined ? error.row + 1 : 0,
        message: error.message || 'CSV parsing error',
      })
    })
  }

  return {
    data: parseResult.data || [],
    errors,
  }
}

/**
 * Validate CSV row against required fields
 */
export function validateCSVRow(row: CSVRow, rowNumber: number): CSVValidationResult {
  const errors: Array<{ row: number; message: string }> = []

  // Required fields
  if (!row.name || row.name.trim() === '') {
    errors.push({ row: rowNumber, message: "Missing required field 'name'" })
  }

  if (!row.primary_role || row.primary_role.trim() === '') {
    errors.push({ row: rowNumber, message: "Missing required field 'primary_role'" })
  }

  if (!row.primary_location_city || row.primary_location_city.trim() === '') {
    errors.push({ row: rowNumber, message: "Missing required field 'primary_location_city'" })
  }

  if (!row.primary_location_state || row.primary_location_state.trim() === '') {
    errors.push({ row: rowNumber, message: "Missing required field 'primary_location_state'" })
  } else if (row.primary_location_state.length !== 2) {
    errors.push({
      row: rowNumber,
      message: "Field 'primary_location_state' must be a 2-letter state code",
    })
  }

  if (row.contact_email && row.contact_email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(row.contact_email)) {
      errors.push({ row: rowNumber, message: "Invalid email format in 'contact_email'" })
    }
  }

  // Validate optional URL fields
  if (row.portfolio_url && row.portfolio_url.trim() !== '') {
    try {
      new URL(row.portfolio_url)
    } catch {
      errors.push({ row: rowNumber, message: "Invalid URL format in 'portfolio_url'" })
    }
  }

  if (row.website && row.website.trim() !== '') {
    try {
      new URL(row.website)
    } catch {
      errors.push({ row: rowNumber, message: "Invalid URL format in 'website'" })
    }
  }

  if (row.instagram_url && row.instagram_url.trim() !== '') {
    try {
      new URL(row.instagram_url)
    } catch {
      errors.push({ row: rowNumber, message: "Invalid URL format in 'instagram_url'" })
    }
  }

  if (row.vimeo_url && row.vimeo_url.trim() !== '') {
    try {
      new URL(row.vimeo_url)
    } catch {
      errors.push({ row: rowNumber, message: "Invalid URL format in 'vimeo_url'" })
    }
  }

  // Validate union_status enum
  if (row.union_status && row.union_status.trim() !== '') {
    const validUnionStatuses = ['union', 'non-union', 'either']
    if (!validUnionStatuses.includes(row.union_status.toLowerCase())) {
      errors.push({
        row: rowNumber,
        message: "Field 'union_status' must be one of: union, non-union, either",
      })
    }
  }

  // Validate years_experience is a number
  if (row.years_experience && row.years_experience.trim() !== '') {
    const years = parseInt(row.years_experience, 10)
    if (isNaN(years) || years < 0) {
      errors.push({
        row: rowNumber,
        message: "Field 'years_experience' must be a positive number",
      })
    }
  }

  // Validate bio length
  if (row.bio && row.bio.length > 2000) {
    errors.push({ row: rowNumber, message: "Field 'bio' must be 2000 characters or less" })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Convert CSV row to CreateProfileData format
 */
export function csvRowToProfileData(row: CSVRow): CreateProfileData {
  // Parse comma-separated arrays
  const secondaryRoles = row.secondary_roles
    ? row.secondary_roles
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r !== '')
    : undefined

  const specialties = row.specialties
    ? row.specialties
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '')
    : undefined

  // Parse additional_markets (format: "City1,ST1;City2,ST2" or similar)
  // For now, we'll leave this as undefined since format is TBD
  const additionalMarkets = undefined

  return {
    name: row.name.trim(),
    primary_role: row.primary_role.trim(),
    primary_location_city: row.primary_location_city.trim(),
    primary_location_state: row.primary_location_state.trim().toUpperCase(),
    contact_email: row.contact_email?.trim() || null,
    contact_phone: row.contact_phone?.trim() || null,
    bio: row.bio?.trim() || null,
    portfolio_url: row.portfolio_url?.trim() || null,
    website: row.website?.trim() || null,
    instagram_url: row.instagram_url?.trim() || null,
    vimeo_url: row.vimeo_url?.trim() || null,
    union_status:
      row.union_status?.trim().toLowerCase() === 'union' ||
      row.union_status?.trim().toLowerCase() === 'non-union' ||
      row.union_status?.trim().toLowerCase() === 'either'
        ? (row.union_status.trim().toLowerCase() as 'union' | 'non-union' | 'either')
        : null,
    years_experience: row.years_experience
      ? parseInt(row.years_experience, 10)
      : null,
    secondary_roles: secondaryRoles && secondaryRoles.length > 0 ? secondaryRoles : null,
    specialties: specialties && specialties.length > 0 ? specialties : null,
    additional_markets: additionalMarkets || null,
    profile_status: 'pending_review',
  }
}

