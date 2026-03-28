import { redirect } from 'next/navigation'
import { authService } from '@/lib/services/authService'
import { SignUpForm } from '@/components/auth/SignUpForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Crew Up',
  description: 'Create a free producer account to access crew contact information.',
  robots: 'noindex, nofollow',
}

export default async function SignUpPage() {
  const user = await authService.getCurrentUser()

  if (user) {
    redirect('/')
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <SignUpForm />
      </div>
    </main>
  )
}
