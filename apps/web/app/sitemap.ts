import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBaseUrl } from '@/lib/utils/url'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    const supabase = createAdminClient()
    let allProfiles: { slug: string; updated_at: string }[] = []
    let offset = 0
    while (true) {
      const { data } = await supabase
        .from('profiles')
        .select('slug, updated_at')
        .eq('profile_status', 'approved')
        .range(offset, offset + 999)
      if (!data || data.length === 0) break
      allProfiles = allProfiles.concat(data)
      if (data.length < 1000) break
      offset += 1000
    }

    const profilePages: MetadataRoute.Sitemap = allProfiles.map((profile) => ({
      url: `${baseUrl}/crew/${profile.slug}`,
      lastModified: new Date(profile.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticPages, ...profilePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}

