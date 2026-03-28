'use client'

import { useState } from 'react'
import { PendingReviewSection } from './PendingReviewSection'
import { AllProfilesSection } from './AllProfilesSection'
import { AdminProfileEditModal } from './AdminProfileEditModal'
import { BulkImportSection } from './BulkImportSection'
import type { Profile } from '@crew-up/shared'

export function AdminDashboardTabs() {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'bulk-import'>('pending')
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile)
    setIsEditModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setEditingProfile(null)
  }

  const handleSaveProfile = async () => {
    // Close modal first
    handleCloseModal()
    // Force a page reload to refresh data
    window.location.reload()
  }

  return (
    <>
      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            All Profiles
          </button>
          <button
            onClick={() => setActiveTab('bulk-import')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'bulk-import'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Bulk Import
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' && <PendingReviewSection />}
      {activeTab === 'all' && <AllProfilesSection onEditProfile={handleEditProfile} />}
      {activeTab === 'bulk-import' && <BulkImportSection />}

      {/* Edit Modal */}
      <AdminProfileEditModal
        profile={editingProfile}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProfile}
      />
    </>
  )
}

