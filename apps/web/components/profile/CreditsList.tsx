import type { Credit } from '@crew-up/shared'
import { EmptyState } from '@/components/ui/EmptyState'
import { Film, Calendar, Clapperboard, Building2, User } from 'lucide-react'

interface CreditsListProps {
  credits: Credit[]
  creditsText?: string | null
}

export function CreditsList({ credits, creditsText }: CreditsListProps) {
  // If no structured credits, check for text credits
  if (credits.length === 0) {
    if (creditsText && creditsText.trim()) {
      // Display text credits
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Credits</h2>
          <div className="p-4 rounded border bg-card">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">
                {creditsText}
              </pre>
            </div>
          </div>
        </div>
      )
    }
    
    // No credits at all
    return (
      <EmptyState
        variant="credits"
        title="No credits yet"
        description="This crew member hasn't added any credits to their profile."
      />
    )
  }

  // Sort credits by display_order (lower numbers = higher priority)
  const sortedCredits = [...credits].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">Credits</h2>
        <span className="text-sm text-muted-foreground">
          ({credits.length})
        </span>
      </div>

      <div className="space-y-4">
        {sortedCredits.map((credit) => (
          <div
            key={credit.id}
            className="group relative p-4 rounded border bg-card hover:border-foreground/20 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-2">
                  {credit.project_title}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clapperboard className="h-4 w-4" />
                    {credit.role}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Film className="h-4 w-4" />
                    {credit.project_type}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {credit.year}
                  </span>
                </div>

                {(credit.production_company || credit.director) && (
                  <div className="mt-3 pt-3 border-t flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {credit.production_company && (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-4 w-4" />
                        {credit.production_company}
                      </span>
                    )}
                    {credit.director && (
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        Dir. {credit.director}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
