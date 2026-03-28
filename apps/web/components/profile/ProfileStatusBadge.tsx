import type { Profile } from '@crew-up/shared'
import { CheckCircle2, Circle } from 'lucide-react'

interface ProfileStatusBadgeProps {
  profile: Profile
  size?: 'sm' | 'md' | 'lg'
}

export function ProfileStatusBadge({ profile, size = 'md' }: ProfileStatusBadgeProps) {
  // Show Verified badge if verified
  if (profile.is_verified) {
    const sizeClasses = {
      sm: 'text-xs px-2 py-0.5 gap-1',
      md: 'text-sm px-3 py-1 gap-1.5',
      lg: 'text-base px-4 py-1.5 gap-2',
    }

    const iconSizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    }

    return (
      <div
        className={`inline-flex items-center rounded-full bg-blue-100 text-blue-700 font-medium ${sizeClasses[size]}`}
        title="Verified Profile"
      >
        <CheckCircle2 className={iconSizes[size]} />
        <span>Verified</span>
      </div>
    )
  }

  // Show Listed badge if approved but not verified
  if (profile.profile_status === 'approved') {
    const sizeClasses = {
      sm: 'text-xs px-2 py-0.5 gap-1',
      md: 'text-sm px-3 py-1 gap-1.5',
      lg: 'text-base px-4 py-1.5 gap-2',
    }

    const iconSizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    }

    return (
      <div
        className={`inline-flex items-center rounded-full bg-green-100 text-green-700 font-medium ${sizeClasses[size]}`}
        title="Listed Profile"
      >
        <Circle className={iconSizes[size]} />
        <span>Listed</span>
      </div>
    )
  }

  // Don't show badge for pending or rejected profiles
  return null
}

