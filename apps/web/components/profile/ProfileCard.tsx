import Link from 'next/link'
import type { Profile, Credit } from '@crew-up/shared'
import { Avatar } from '@/components/ui/Avatar'
import { MapPin, ArrowRight, Film } from 'lucide-react'

interface ProfileCardProps {
  profile: Profile & { credits: Credit[] }
}

export function ProfileCard({ profile }: ProfileCardProps) {
  // Get top 3 credits (already sorted by display_order from service)
  const topCredits = profile.credits.slice(0, 3)

  return (
    <article className="border rounded-xl p-6 bg-card card-hover group">
      <div className="flex gap-4">
        {/* Profile Photo */}
        <Avatar
          src={profile.photo_url}
          alt={profile.name}
          name={profile.name}
          size="lg"
        />

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
            {profile.name}
          </h3>
          <p className="text-muted-foreground mb-1 font-medium">
            {profile.primary_role}
          </p>
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {profile.primary_location_city}, {profile.primary_location_state}
          </p>

          {/* Top 3 Credits */}
          {topCredits.length > 0 && (
            <div className="space-y-1.5 mb-4">
              {topCredits.map((credit) => (
                <div key={credit.id} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Film className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground/70" />
                  <span>
                    <span className="font-medium text-foreground">{credit.project_title}</span>
                    {' · '}
                    <span>{credit.role}</span>
                    {' · '}
                    <span>{credit.year}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* View Profile Link */}
          <Link
            href={`/crew/${profile.slug}`}
            className="inline-flex items-center gap-1 text-primary hover:gap-2 transition-all text-sm font-medium"
          >
            View Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
