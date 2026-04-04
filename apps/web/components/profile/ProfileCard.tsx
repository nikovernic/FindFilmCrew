import Link from 'next/link'
import type { Profile, Credit } from '@crew-up/shared'
import { Avatar } from '@/components/ui/Avatar'

interface ProfileCardProps {
  profile: Omit<Profile, 'credits'> & { credits: Credit[] }
}

function truncateBio(bio: string | null, max: number = 80): string | null {
  if (!bio) return null
  if (bio.length <= max) return bio
  const cut = bio.substring(0, max).trim()
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? cut.substring(0, lastSpace) : cut) + '...'
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const topCredits = profile.credits.slice(0, 2)
  const location = `${profile.primary_location_city}, ${profile.primary_location_state}`
  const bio = truncateBio(profile.bio)

  return (
    <Link
      href={`/crew/${profile.slug}`}
      className="flex gap-3 border-b py-3 hover:bg-muted/50 -mx-2 px-2"
    >
      <Avatar
        src={profile.photo_url}
        alt={profile.name}
        name={profile.name}
        size="sm"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <div className="min-w-0">
            <span className="font-medium text-sm">{profile.name}</span>
            <span className="text-muted-foreground text-sm ml-1.5">{profile.primary_role}</span>
            {profile.secondary_roles && profile.secondary_roles.length > 0 && (
              <span className="text-muted-foreground/60 text-xs"> · {profile.secondary_roles.join(', ')}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{location}</span>
        </div>

        {bio && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{bio}</p>
        )}

        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
          {topCredits.length > 0 && (
            <span>
              {topCredits.map((credit, i) => (
                <span key={credit.id}>
                  {i > 0 && ' · '}
                  {credit.project_title} ({credit.year})
                </span>
              ))}
            </span>
          )}
          {profile.years_experience && (
            <span>{profile.years_experience}yr exp</span>
          )}
          {profile.is_verified && (
            <span className="inline-flex items-center gap-1 text-blue-700 font-medium bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
              ✓ Verified
            </span>
          )}
          {profile.is_featured && (
            <span className="inline-flex items-center gap-1 text-blue-700 font-medium bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
              ✓ Verified
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
