import { requireAuthForPage } from '@/lib/middleware/auth'
import { AccountForm } from '@/components/account/AccountForm'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Account | Crew Up',
  description: 'Manage your account settings.',
  robots: 'noindex, nofollow',
}

export default async function AccountPage() {
  const { user } = await requireAuthForPage()

  const name = user.user_metadata?.name || ''
  const role = user.user_metadata?.role || ''
  const email = user.email || ''

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        <AccountForm
          initialName={name}
          initialRole={role}
          email={email}
        />
      </div>
    </main>
  )
}
