'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AccountFormProps {
  initialName: string
  initialRole: string
  email: string
}

export function AccountForm({ initialName, initialRole, email }: AccountFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [role, setRole] = useState(initialRole)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: { name, role },
      })

      if (error) throw error
      setMessage({ type: 'success', text: 'Profile updated.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      setMessage({ type: 'success', text: 'Password updated.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update password.' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={`p-3 rounded text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Info */}
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Producer, Production Coordinator"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <p className="px-3 py-2 border rounded-md bg-muted text-muted-foreground text-sm">
            {email}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Change Password */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Sign Out */}
      <div className="border-t pt-6">
        <button
          onClick={handleSignOut}
          className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
