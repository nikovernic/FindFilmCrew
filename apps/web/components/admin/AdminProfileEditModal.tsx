'use client'

import { useState, useEffect } from 'react'
import type { Profile } from '@crew-up/shared'
import { AdminProfileEditForm } from './AdminProfileEditForm'

interface AdminProfileEditModalProps {
  profile: Profile | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function AdminProfileEditModal({
  profile: initialProfile,
  isOpen,
  onClose,
  onSave,
}: AdminProfileEditModalProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)

  // Refetch profile when modal opens to ensure we have the latest data
  useEffect(() => {
    if (isOpen && initialProfile) {
      const fetchLatestProfile = async () => {
        try {
          const response = await fetch(`/api/admin/profiles/${initialProfile.id}`, {
            credentials: 'include',
          })
          if (response.ok) {
            const data = await response.json()
            setProfile(data.profile || data)
          }
        } catch (error) {
          console.error('Failed to fetch latest profile:', error)
          // Fallback to initial profile if fetch fails
          setProfile(initialProfile)
        }
      }
      fetchLatestProfile()
    } else {
      setProfile(initialProfile)
    }
  }, [isOpen, initialProfile])

  if (!isOpen || !profile) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Profile: {profile.name}</h2>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded hover:bg-accent transition-colors"
          >
            Close
          </button>
        </div>
        <div className="p-6">
          <AdminProfileEditForm profile={profile} onSave={onSave} onCancel={onClose} />
        </div>
      </div>
    </div>
  )
}

