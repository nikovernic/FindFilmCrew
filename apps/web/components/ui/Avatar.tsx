import Image from 'next/image'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string | null
  alt: string
  name?: string
  size?: AvatarSize
  className?: string
}

const sizeClasses = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-lg',
  lg: 'h-20 w-20 text-2xl',
  xl: 'h-[200px] w-[200px] text-5xl',
}

const imageSizes = {
  sm: 40,
  md: 64,
  lg: 80,
  xl: 200,
}

// Generate a consistent color based on the name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const sizeClass = sizeClasses[size]
  const imageSize = imageSizes[size]

  if (src) {
    return (
      <div className={cn('relative flex-shrink-0 overflow-hidden rounded-full', sizeClass, className)}>
        <Image
          src={src}
          alt={alt}
          width={imageSize}
          height={imageSize}
          className="object-cover w-full h-full"
          sizes={`${imageSize}px`}
        />
      </div>
    )
  }

  // Fallback with initials or icon
  const displayName = name || alt
  const bgColor = getAvatarColor(displayName)

  return (
    <div
      className={cn(
        'flex-shrink-0 rounded-full flex items-center justify-center text-white font-semibold',
        sizeClass,
        bgColor,
        className
      )}
      aria-label={alt}
    >
      {displayName ? (
        getInitials(displayName)
      ) : (
        <User className="h-1/2 w-1/2" />
      )}
    </div>
  )
}
