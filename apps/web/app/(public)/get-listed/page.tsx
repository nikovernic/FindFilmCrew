import { GetListedForm } from '@/components/profile/GetListedForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Listed | Crew Up',
  description: 'Submit your profile to be listed on Crew Up. Get discovered by producers looking for crew in your market.',
}

export default function GetListedPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Get Listed on Crew Up</h1>
          <p className="text-lg text-muted-foreground">
            Submit your profile for review. Once approved, your profile will be live and discoverable by producers.
          </p>
        </div>

        <GetListedForm />
      </div>
    </main>
  )
}

