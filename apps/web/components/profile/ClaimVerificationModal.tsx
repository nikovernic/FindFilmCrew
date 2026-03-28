'use client'

import { X, Mail, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ClaimVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  profileName: string
}

export function ClaimVerificationModal({
  isOpen,
  onClose,
  profileName,
}: ClaimVerificationModalProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isOpen) return

    const checkAuth = async () => {
      setIsChecking(true)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setUserEmail(session?.user?.email || '')
      setIsChecking(false)
    }
    checkAuth()

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-background rounded max-w-md w-full border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b p-4 flex justify-between items-center">
          <h2 id="modal-title" className="text-xl font-bold">
            Claim This Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isChecking ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !isLoggedIn ? (
            <>
              <p className="text-muted-foreground mb-6">
                To claim the profile <strong>{profileName}</strong>, you need to create an account first. Then email us your ID to verify your identity.
              </p>

              <div className="border rounded p-4 mb-6">
                <div className="flex items-start gap-3">
                  <UserPlus className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm mb-2">Step 1: Create an account</p>
                    <div className="flex gap-2">
                      <Link
                        href="/get-listed"
                        onClick={onClose}
                        className="px-3 py-1.5 bg-foreground text-background rounded text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Sign Up
                      </Link>
                      <Link
                        href="/signin"
                        onClick={onClose}
                        className="px-3 py-1.5 border rounded text-sm font-medium hover:bg-accent transition-colors"
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded p-4 mb-6 opacity-60">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm mb-1">Step 2: Email us your ID</p>
                    <p className="text-sm text-muted-foreground">
                      After creating an account, email your ID to{' '}
                      <span className="font-medium">findfilmcrewtexas@gmail.com</span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">
                To claim the profile <strong>{profileName}</strong>, email us a picture of your ID so we can verify your identity and link it to your account{userEmail ? ` (${userEmail})` : ''}.
              </p>

              <div className="border rounded p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm mb-1">Email us your ID:</p>
                    <a
                      href={`mailto:findfilmcrewtexas@gmail.com?subject=Profile Claim Request - ${encodeURIComponent(profileName)}&body=Hi,%0D%0A%0D%0AI would like to claim the profile "${encodeURIComponent(profileName)}" on Film Crew Texas.%0D%0A%0D%0AMy account email: ${encodeURIComponent(userEmail)}%0D%0A%0D%0APlease find my ID attached.%0D%0A%0D%0AThank you!`}
                      className="text-primary hover:underline font-medium break-all"
                    >
                      findfilmcrewtexas@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>What to include:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>A clear photo of your government-issued ID</li>
                  <li>Your profile name in the email</li>
                  <li>We&apos;ll review and link the profile to your account within 1-2 business days</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
