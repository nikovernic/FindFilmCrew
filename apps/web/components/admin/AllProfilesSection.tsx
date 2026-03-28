'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Profile } from '@crew-up/shared'

interface AllProfilesSectionProps {
  onEditProfile: (profile: Profile) => void
}

export function AllProfilesSection({ onEditProfile }: AllProfilesSectionProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null)
  const [deletingProfile, setDeletingProfile] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [linkingProfile, setLinkingProfile] = useState<string | null>(null)
  const [linkEmail, setLinkEmail] = useState('')
  const [linkError, setLinkError] = useState<string | null>(null)
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null)

  const limit = 20

  const loadProfiles = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      })
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const response = await fetch(`/api/admin/profiles?${params.toString()}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to load profiles')
      }
      const data = await response.json()
      setProfiles(data.profiles || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery])

  const toggleFeatured = async (profile: Profile) => {
    setTogglingFeatured(profile.id)
    try {
      const response = await fetch(`/api/admin/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_featured: !profile.is_featured }),
      })
      if (!response.ok) throw new Error('Failed to update')
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id ? { ...p, is_featured: !p.is_featured } : p
        )
      )
    } catch {
      setError('Failed to toggle featured status')
    } finally {
      setTogglingFeatured(null)
    }
  }

  const toggleLowPriority = async (profile: Profile) => {
    try {
      const response = await fetch(`/api/admin/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_low_priority: !profile.is_low_priority }),
      })
      if (!response.ok) throw new Error('Failed to update')
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id ? { ...p, is_low_priority: !p.is_low_priority } : p
        )
      )
    } catch {
      setError('Failed to toggle low priority status')
    }
  }

  const deleteProfile = async (profile: Profile) => {
    if (!confirm(`Delete "${profile.name}"? This cannot be undone.`)) return
    setDeletingProfile(profile.id)
    try {
      const response = await fetch(`/api/admin/profiles/${profile.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to delete')
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id))
      setTotal((prev) => prev - 1)
    } catch {
      setError('Failed to delete profile')
    } finally {
      setDeletingProfile(null)
    }
  }

  const handleLinkUser = async (profileId: string) => {
    if (!linkEmail.trim()) return
    setLinkError(null)
    setLinkSuccess(null)
    try {
      const response = await fetch(`/api/admin/profiles/${profileId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: linkEmail.trim() }),
      })
      const data = await response.json()
      if (!response.ok) {
        setLinkError(data.error || 'Failed to link profile')
        return
      }
      setLinkSuccess(data.message)
      setLinkEmail('')
      setLinkingProfile(null)
      loadProfiles()
    } catch {
      setLinkError('Failed to link profile')
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  useEffect(() => {
    // Debounce search
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      setCurrentPage(1)
      loadProfiles()
    }, 500)

    setDebounceTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [searchQuery, loadProfiles])

  const totalPages = Math.ceil(total / limit)

  if (error) {
    return (
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-2xl font-bold mb-4">All Profiles</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">All Profiles ({total})</h2>
        
        {linkSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm flex justify-between items-center">
            <span>{linkSuccess}</span>
            <button onClick={() => setLinkSuccess(null)} className="text-green-600 hover:text-green-800">✕</button>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, role, location, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading profiles...</div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? 'No profiles found matching your search.' : 'No profiles found.'}
        </div>
      ) : (
        <>
          {/* Profile Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold">Role</th>
                  <th className="text-left p-3 font-semibold">Location</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Claimed</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-b hover:bg-accent/50">
                    <td className="p-3">{profile.name}</td>
                    <td className="p-3">{profile.primary_role}</td>
                    <td className="p-3">
                      {profile.primary_location_city}, {profile.primary_location_state}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs ${
                            profile.is_verified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {profile.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs ${
                            profile.profile_status === 'approved'
                              ? 'bg-blue-100 text-blue-800'
                              : profile.profile_status === 'pending_review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {profile.profile_status === 'approved'
                            ? 'Approved'
                            : profile.profile_status === 'pending_review'
                            ? 'Pending'
                            : 'Rejected'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      {profile.user_id ? (
                        <span className="text-green-600">Yes</span>
                      ) : linkingProfile === profile.id ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1">
                            <input
                              type="email"
                              value={linkEmail}
                              onChange={(e) => { setLinkEmail(e.target.value); setLinkError(null) }}
                              placeholder="user@email.com"
                              className="px-2 py-1 text-sm border rounded w-40 focus:outline-none focus:ring-1 focus:ring-primary"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleLinkUser(profile.id)
                                if (e.key === 'Escape') { setLinkingProfile(null); setLinkEmail(''); setLinkError(null) }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleLinkUser(profile.id)}
                              className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Link
                            </button>
                            <button
                              onClick={() => { setLinkingProfile(null); setLinkEmail(''); setLinkError(null) }}
                              className="px-2 py-1 text-sm border rounded hover:bg-accent"
                            >
                              ✕
                            </button>
                          </div>
                          {linkError && <span className="text-xs text-red-600">{linkError}</span>}
                        </div>
                      ) : (
                        <button
                          onClick={() => { setLinkingProfile(profile.id); setLinkEmail(''); setLinkError(null); setLinkSuccess(null) }}
                          className="px-2 py-1 text-sm border border-blue-200 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                        >
                          Link User
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFeatured(profile)}
                          disabled={togglingFeatured === profile.id}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            profile.is_featured
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'border hover:bg-accent'
                          }`}
                        >
                          {togglingFeatured === profile.id
                            ? '...'
                            : profile.is_featured
                            ? '★ High Priority'
                            : 'High Pri'}
                        </button>
                        <button
                          onClick={() => toggleLowPriority(profile)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            profile.is_low_priority
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'border hover:bg-accent'
                          }`}
                        >
                          {profile.is_low_priority ? '↓ Low Priority' : 'Low Pri'}
                        </button>
                        <button
                          onClick={() => onEditProfile(profile)}
                          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                          Edit
                        </button>
                        <a
                          href={`/crew/${profile.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm border rounded hover:bg-accent transition-colors"
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteProfile(profile)}
                          disabled={deletingProfile === profile.id}
                          className="px-3 py-1 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          {deletingProfile === profile.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

