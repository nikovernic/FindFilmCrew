'use client'

import { useState, useEffect, useRef } from 'react'
import type { Profile } from '@crew-up/shared'
import { getAllRoles, normalizeRole } from '@/lib/constants/crewRoles'

const ALL_ROLES = getAllRoles()

function RoleInlineEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (role: string) => void
}) {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = inputValue.trim()
    ? ALL_ROLES.filter((r) =>
        r.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 8)
    : []

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (role: string) => {
    const normalized = normalizeRole(role)
    setInputValue(normalized)
    onChange(normalized)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filtered.length === 0) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filtered.length) {
          handleSelect(filtered[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const isChanged = inputValue !== value

  return (
    <div ref={containerRef} className="relative inline-block">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          onChange(e.target.value)
          setIsOpen(true)
          setSelectedIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className={`px-2 py-1 border rounded text-sm w-56 focus:outline-none focus:ring-1 focus:ring-primary ${
          isChanged ? 'border-blue-400 bg-blue-50' : ''
        }`}
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded z-50 max-h-48 overflow-y-auto shadow-lg">
          {filtered.map((role, index) => (
            <button
              key={role}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(role)
              }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors ${
                selectedIndex === index ? 'bg-accent' : ''
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function PendingReviewSection() {
  const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleOverrides, setRoleOverrides] = useState<Record<string, string>>({})

  useEffect(() => {
    loadPendingProfiles()
  }, [])

  const loadPendingProfiles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/profiles?status=pending_review', {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to load pending profiles')
      }
      const data = await response.json()
      setPendingProfiles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending profiles')
    } finally {
      setIsLoading(false)
    }
  }

  const saveRoleIfChanged = async (profileId: string) => {
    const newRole = roleOverrides[profileId]
    if (!newRole) return true

    const profile = pendingProfiles.find((p) => p.id === profileId)
    if (!profile || newRole.trim() === profile.primary_role) return true

    try {
      const response = await fetch(`/api/admin/profiles/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ primary_role: newRole.trim() }),
      })
      if (!response.ok) throw new Error('Failed to update role')
      return true
    } catch {
      alert('Failed to update role')
      return false
    }
  }

  const handleApprove = async (profileId: string, priority?: 'low' | 'high') => {
    try {
      const roleSaved = await saveRoleIfChanged(profileId)
      if (!roleSaved) return

      const body = priority ? JSON.stringify(priority === 'low' ? { low_priority: true } : { high_priority: true }) : undefined
      const response = await fetch(`/api/admin/profiles/${profileId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body,
      })

      if (!response.ok) {
        throw new Error('Failed to approve profile')
      }

      await loadPendingProfiles()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve profile')
    }
  }

  const handleReject = async (profileId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/profiles/${profileId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: reason || null }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject profile')
      }

      await loadPendingProfiles()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject profile')
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading pending profiles...</div>
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
        {error}
      </div>
    )
  }

  if (pendingProfiles.length === 0) {
    return (
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-2xl font-bold mb-4">Pending Review</h2>
        <p className="text-muted-foreground">No profiles pending review.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-2xl font-bold mb-6">Pending Review ({pendingProfiles.length})</h2>

      <div className="space-y-6">
        {pendingProfiles.map((profile) => (
          <div
            key={profile.id}
            className="border rounded-lg p-6 bg-card"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{profile.name}</h3>
                <div className="text-muted-foreground mb-1 flex items-center gap-2">
                  <strong>Role:</strong>
                  <RoleInlineEditor
                    value={roleOverrides[profile.id] ?? profile.primary_role}
                    onChange={(role) =>
                      setRoleOverrides((prev) => ({ ...prev, [profile.id]: role }))
                    }
                  />
                </div>
                <p className="text-muted-foreground">
                  <strong>Location:</strong> {profile.primary_location_city},{' '}
                  {profile.primary_location_state}
                </p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> {profile.contact_email}
                </p>
                {profile.contact_phone && (
                  <p className="text-muted-foreground">
                    <strong>Phone:</strong> {profile.contact_phone}
                  </p>
                )}
              </div>
              <div>
                {profile.bio && (
                  <p className="text-muted-foreground mb-2">
                    <strong>Bio:</strong> {profile.bio}
                  </p>
                )}
                {profile.portfolio_url && (
                  <p className="text-muted-foreground mb-2">
                    <strong>Portfolio:</strong>{' '}
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.portfolio_url}
                    </a>
                  </p>
                )}
                {profile.website && (
                  <p className="text-muted-foreground mb-2">
                    <strong>Website:</strong>{' '}
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.website}
                    </a>
                  </p>
                )}
                {profile.verification_id_url && (
                  <p className="text-muted-foreground mb-2">
                    <strong>ID Photo:</strong>{' '}
                    <a
                      href={profile.verification_id_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View ID Photo
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleApprove(profile.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Approve
              </button>
              <button
                onClick={() => handleApprove(profile.id, 'high')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Approve and rank higher in search results"
              >
                Approve (High Priority)
              </button>
              <button
                onClick={() => handleApprove(profile.id, 'low')}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                title="Approve but rank lower in search results"
              >
                Approve (Low Priority)
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Rejection reason (optional):')
                  handleReject(profile.id, reason || undefined)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reject
              </button>
              <a
                href={`/crew/${profile.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border rounded hover:bg-accent transition-colors text-sm"
              >
                View Profile
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
