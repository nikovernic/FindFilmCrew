'use client'

import { useState } from 'react'
import type { Profile } from '@crew-up/shared'
import { Avatar } from '@/components/ui/Avatar'
import { ProfileStatusBadge } from '@/components/profile/ProfileStatusBadge'
import { RevealableContact } from '@/components/profile/RevealableContact'
import { ClaimVerificationModal } from '@/components/profile/ClaimVerificationModal'
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Instagram,
  Video,
  Award,
  Clock,
  Shield
} from 'lucide-react'

interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <div className="border-b pb-8 mb-8">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Profile Photo */}
        <div className="flex-shrink-0 flex justify-center md:justify-start">
          <Avatar
            src={profile.photo_url}
            alt={profile.name}
            name={profile.name}
            size="xl"
            className="h-[120px] w-[120px] md:h-[140px] md:w-[140px] border-2 border-border"
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          {/* Name and Status Badge - Inline */}
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{profile.name}</h1>
            <ProfileStatusBadge profile={profile} size="lg" />
          </div>
          
          {/* Title/Role */}
          <p className="text-base md:text-lg text-muted-foreground font-medium mb-1">
            {profile.primary_role}
          </p>
          {profile.secondary_roles && profile.secondary_roles.length > 0 && (
            <p className="text-sm text-muted-foreground/70 mb-3 md:mb-4">
              Also: {profile.secondary_roles.join(', ')}
            </p>
          )}
          {(!profile.secondary_roles || profile.secondary_roles.length === 0) && (
            <div className="mb-3 md:mb-4" />
          )}
          
          {/* Location */}
          <p className="text-base text-muted-foreground mb-4 md:mb-6 flex items-center gap-2">
            <MapPin className="h-4 w-4 md:h-5 md:w-5" />
            {profile.primary_location_city}, {profile.primary_location_state}
          </p>
          
          {/* Experience Badge */}
          {profile.years_experience && (
            <div className="text-sm text-muted-foreground mb-4 md:mb-6 flex items-center gap-3">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{profile.years_experience} years experience</span>
              </span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-muted-foreground mb-6 md:mb-8 max-w-2xl leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Contact & Links */}
          <div className="flex flex-wrap gap-3 mb-6 md:mb-8">
            {profile.contact_email && (
              <RevealableContact
                type="email"
                value={profile.contact_email}
                icon={<Mail className="h-4 w-4 text-primary" />}
              />
            )}
            {profile.contact_phone && (
              <RevealableContact
                type="phone"
                value={profile.contact_phone}
                icon={<Phone className="h-4 w-4 text-primary" />}
              />
            )}
          </div>

          {/* External Links */}
          <div className="flex flex-wrap gap-3 mb-6 md:mb-8">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded border hover:bg-accent text-sm transition-colors"
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
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded border hover:bg-accent text-sm transition-colors"
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
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded border hover:bg-accent text-sm transition-colors"
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
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded border hover:bg-accent text-sm transition-colors"
              >
                <Video className="h-4 w-4" />
                Vimeo
              </a>
            )}
          </div>

          {/* Union Status Badge */}
          {profile.union_status && (
            <div className="flex flex-wrap gap-3 mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded border text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                {profile.union_status}
              </div>
            </div>
          )}

          {/* Specialties */}
          {profile.specialties && profile.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
              {profile.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="inline-flex items-center px-2 py-1 border rounded text-sm text-muted-foreground"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          {/* Claim Profile Button - Only show for unclaimed profiles */}
          {!profile.is_claimed && (
            <div className="mt-6 md:mt-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-foreground text-background hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <Shield className="h-4 w-4" />
                Claim This Profile
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Verified profiles get booked ~3x more on average
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Claim Verification Modal */}
      <ClaimVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileName={profile.name}
      />
    </div>
  )
}
