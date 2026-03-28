'use client'

import { X, Mail } from 'lucide-react'
import { useEffect } from 'react'

interface VerificationEmailModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VerificationEmailModal({
  isOpen,
  onClose,
}: VerificationEmailModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    // Prevent body scroll when modal is open
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
            Verify Your Profile
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
          <p className="text-muted-foreground mb-6">
            To verify your profile and unlock the benefits of verification, please email us a picture of your ID.
          </p>

          <div className="border rounded p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm mb-1">Email us your ID:</p>
                <a
                  href="mailto:findfilmcrewtexas@gmail.com?subject=Profile Verification Request&body=Hi,%0D%0A%0D%0AI would like to verify my profile on Film Crew Texas.%0D%0A%0D%0APlease find my ID attached.%0D%0A%0D%0AThank you!"
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
              <li>We'll review and verify your profile within 1-2 business days</li>
            </ul>
          </div>
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

