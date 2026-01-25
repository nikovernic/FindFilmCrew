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
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {/* Decorative background circles */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 rounded-full bg-muted/50" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-muted/70" />
        </div>
        <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">
        {title || config.title}
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {description || config.description}
      </p>

      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
