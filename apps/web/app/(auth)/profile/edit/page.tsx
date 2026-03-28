import { requireAuthForPage } from '@/lib/middleware/auth'
import { profileService } from '@/lib/services/profileService'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Edit Profile | Crew Up',
  description: 'Edit your crew profile.',
  robots: 'noindex, nofollow',
}

export default async function ProfileEditPage() {
  const { user } = await requireAuthForPage()

  const userRole = user.user_metadata?.role || 'producer'
  const profile = await profileService.getProfileByUserId(user.id)

  if (!profile && userRole === 'producer') {
    const { redirect } = await import('next/navigation')
    redirect('/account')
  }

  if (!profile) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">No Profile Found</h1>
          <p className="text-muted-foreground mb-6">
            You don&apos;t have a crew profile yet. Would you like to create one?
          </p>
          <Link
            href="/get-listed"
            className="px-5 py-2.5 bg-foreground text-background rounded hover:opacity-90 transition-opacity font-medium"
          >
            Get Listed
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <Link
            href={`/crew/${profile.slug}`}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            View Profile
          </Link>
        </div>
        <ProfileEditForm profile={profile} />
      </div>
    </main>
  )
}

