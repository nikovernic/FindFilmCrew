/**
 * URL utility functions
 * Constructs absolute URLs for SEO metadata (OG tags, canonical URLs)
 */

/**
 * Get the base URL for the application
 * Uses environment variables if available, otherwise defaults to localhost:3000
 */
export function getBaseUrl(): string {
  // Allow explicit SITE_URL override (highest priority)
  // Check both server-side and client-side env vars
  if (process.env.SITE_URL) {
    return process.env.SITE_URL
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Default to localhost for development, production domain otherwise
  return process.env.NODE_ENV === 'production'
    ? 'https://www.findfilmcrewtexas.com'
    : 'http://localhost:3000'
}

/**
 * Construct an absolute URL from a path
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

