import { getAuthUser } from '@/lib/middleware/auth'
import { profileService } from '@/lib/services/profileService'
import { ProfileCreateForm } from '@/components/profile/ProfileCreateForm'
import { redirect } from 'next/navigation'

export default async function CreateProfilePage() {
  // Check if user is authenticated (optional)
  const auth = await getAuthUser()

  // If user is authenticated, check if they already have a profile
  if (auth) {
    const existingProfile = await profileService.getProfileByUserId(auth.user.id)
    if (existingProfile) {
      // If user already has a profile, redirect to profile edit page
      redirect('/profile/edit')
    }
  }

  // Allow both authenticated and unauthenticated users to access this page
  // No authentication required - profiles are created as unclaimed
  return <ProfileCreateForm />
}

