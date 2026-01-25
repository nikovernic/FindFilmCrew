import type { Profile } from '@crew-up/shared'
import { Avatar } from '@/components/ui/Avatar'
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Instagram,
  Video,
  Award,
  Clock
} from 'lucide-react'

interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="border-b pb-8 mb-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Photo */}
        <div className="flex-shrink-0 flex justify-center md:justify-start">
          <Avatar
            src={profile.photo_url}
            alt={profile.name}
            name={profile.name}
            size="xl"
            className="rounded-2xl"
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{profile.name}</h1>
          <p className="text-xl text-primary font-medium mb-2">
            {profile.primary_role}
          </p>
          <p className="text-lg text-muted-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {profile.primary_location_city}, {profile.primary_location_state}
          </p>

          {/* Bio */}
          {profile.bio && (
            <p className="text-muted-foreground mb-6 max-w-2xl leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Contact & Links */}
          <div className="flex flex-wrap gap-3 mb-6">
            {profile.contact_email && (
              <a
                href={`mailto:${profile.contact_email}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                {profile.contact_email}
              </a>
            )}
            {profile.contact_phone && (
              <a
                href={`tel:${profile.contact_phone}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
              >
                <Phone className="h-4 w-4 text-primary" />
                {profile.contact_phone}
              </a>
            )}
          </div>

          {/* External Links */}
          <div className="flex flex-wrap gap-3 mb-6">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent text-sm font-medium transition-colors"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
            {profile.portfolio_url && (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent text-sm font-medium transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                Portfolio
              </a>
            )}
            {profile.instagram_url && (
              <a
                href={profile.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent text-sm font-medium transition-colors"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            )}
            {profile.vimeo_url && (
              <a
                href={profile.vimeo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent text-sm font-medium transition-colors"
              >
                <Video className="h-4 w-4" />
                Vimeo
              </a>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3">
            {profile.union_status && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Award className="h-4 w-4" />
                {profile.union_status}
              </div>
            )}
            {profile.years_experience && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                <Clock className="h-4 w-4" />
                {profile.years_experience} years experience
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
