'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_PASSWORD = 'findfilmcrew' // Simple password for admin access

export function AdminPasswordGate() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (password === ADMIN_PASSWORD) {
      // Set admin token in cookie for API authentication
      // Use SameSite=Lax for localhost compatibility
      document.cookie = `admin_token=${ADMIN_PASSWORD}; path=/; max-age=86400; SameSite=Lax` // 24 hours
      // Store in sessionStorage to persist across page reloads
      sessionStorage.setItem('admin_authenticated', 'true')
      // Small delay to ensure cookie is set before reload
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full border rounded-lg p-8 bg-card">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Enter the admin password to access the dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Admin Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter admin password"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

