import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignInForm } from '@/components/auth/SignInForm'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign In | Crew Up',
  description: 'Sign in to your Crew Up account to manage your profile.',
  robots: 'noindex, nofollow',
}

export default async function SignInPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/profile/edit')
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <SignInForm />
      </div>
    </main>
  )
}

