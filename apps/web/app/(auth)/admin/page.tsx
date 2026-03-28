'use client'

import { useState, useEffect } from 'react'
import { AdminDashboardTabs } from '@/components/admin/AdminDashboardTabs'
import { AdminPasswordGate } from '@/components/admin/AdminPasswordGate'

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if authenticated via sessionStorage
    const authenticated = sessionStorage.getItem('admin_authenticated') === 'true'
    setIsAuthenticated(authenticated)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminPasswordGate />
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
              <p className="text-lg text-muted-foreground">
                Manage crew profiles and review submissions
              </p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('admin_authenticated')
                // Clear admin token cookie
                document.cookie = 'admin_token=; path=/; max-age=0'
                window.location.reload()
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Sign Out
            </button>
          </div>
        </div>

        <AdminDashboardTabs />
      </div>
    </main>
  )
}
