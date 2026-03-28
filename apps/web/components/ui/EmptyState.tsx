import { Search, Users, FileQuestion, Inbox, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

type EmptyStateVariant = 'search' | 'profiles' | 'credits' | 'inbox' | 'generic'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

const variants = {
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
  },
  profiles: {
    icon: Users,
    title: 'No profiles yet',
    description: 'Crew profiles will appear here once they\'re added to the platform.',
  },
  credits: {
    icon: FolderOpen,
    title: 'No credits available',
    description: 'This crew member hasn\'t added any credits to their profile yet.',
  },
  inbox: {
    icon: Inbox,
    title: 'No messages',
    description: 'You don\'t have any messages yet.',
  },
  generic: {
    icon: FileQuestion,
    title: 'Nothing here',
    description: 'There\'s nothing to display at the moment.',
  },
}

export function EmptyState({
  variant = 'generic',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = variants[variant]
  const Icon = config.icon

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <Icon className="h-6 w-6 text-muted-foreground mb-4" />

      <h3 className="text-base font-semibold mb-1">
        {title || config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">
        {description || config.description}
      </p>

      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="text-sm underline text-muted-foreground hover:text-foreground transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="text-sm underline text-muted-foreground hover:text-foreground transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
