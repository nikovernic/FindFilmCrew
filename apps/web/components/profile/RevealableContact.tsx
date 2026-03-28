'use client'

import { useState, useEffect } from 'react'
import { Eye, X, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface RevealableContactProps {
  type: 'email' | 'phone'
  value: string
  icon: React.ReactNode
}

function ProducerSignupModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-10 w-10 text-muted-foreground" />
          </div>

          <h2 className="text-lg font-semibold mb-2">
            Create a Producer Account
          </h2>

          <p className="text-sm text-muted-foreground mb-2">
            Create a free account to see contact info. Verify with ID for unlimited access to phone numbers and emails.
          </p>

          <p className="text-xs text-muted-foreground mb-6">
            We protect all crew members in the directory from spam.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/signup"
              className="w-full px-4 py-2.5 bg-foreground text-background rounded hover:opacity-90 transition-opacity text-sm font-medium text-center"
            >
              Sign Up Free
            </Link>
            <Link
              href="/signin"
              className="w-full px-4 py-2.5 border rounded hover:bg-accent transition-colors text-sm font-medium text-center"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RevealableContact({ type, value, icon }: RevealableContactProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  const handleClick = () => {
    if (isLoggedIn) {
      setIsRevealed(true)
    } else {
      setShowModal(true)
    }
  }

  if (isRevealed) {
    return (
      <a
        href={type === 'email' ? `mailto:${value}` : `tel:${value}`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
      >
        {icon}
        {value}
      </a>
    )
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors cursor-pointer"
        type="button"
      >
        {icon}
        <span>Click to reveal {type === 'email' ? 'email' : 'phone'}</span>
        <Eye className="h-4 w-4 opacity-60" />
      </button>

      {showModal && <ProducerSignupModal onClose={() => setShowModal(false)} />}
    </>
  )
}
