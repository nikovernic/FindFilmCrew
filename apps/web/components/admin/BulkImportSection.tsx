'use client'

import { useState } from 'react'

interface ImportResult {
  total: number
  successful: number
  failed: number
  errors: Array<{ row: number; message: string }>
}

export function BulkImportSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file')
      setSelectedFile(null)
      return
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit')
      setSelectedFile(null)
      return
    }

    setError(null)
    setSelectedFile(file)
    setImportResult(null)
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)
    setUploadProgress('Preparing upload...')
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/admin/profiles/bulk-import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to import profiles')
      }

      const result: ImportResult = await response.json()
      setImportResult(result)
      setSelectedFile(null)
      setUploadProgress('')

      // Reset file input
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import profiles')
      setUploadProgress('')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-2xl font-bold mb-6">Bulk Import</h2>

      <div className="space-y-6">
        {/* File Input Section */}
        <div>
          <label
            htmlFor="csv-file-input"
            className="block text-sm font-medium mb-2"
          >
            Select CSV File
          </label>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Maximum file size: 10MB. Required columns: name, primary_role,
            primary_location_city, primary_location_state. Optional: contact_email, contact_phone, bio, website, etc.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            {error}
          </div>
        )}

        {/* Progress Display */}
        {isUploading && uploadProgress && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            {uploadProgress}
          </div>
        )}

        {/* Import Button */}
        <button
          onClick={handleImport}
          disabled={!selectedFile || isUploading}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Importing...' : 'Import Profiles'}
        </button>

        {/* Results Display */}
        {importResult && (
          <div className="mt-6 p-4 border rounded-md">
            <h3 className="text-lg font-semibold mb-4">Import Results</h3>
            <div className="space-y-2 mb-4">
              <p>
                <strong>Total rows:</strong> {importResult.total}
              </p>
              <p className="text-green-600">
                <strong>Successful:</strong> {importResult.successful}
              </p>
              {importResult.failed > 0 && (
                <p className="text-red-600">
                  <strong>Failed:</strong> {importResult.failed}
                </p>
              )}
            </div>

            {importResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Errors:</h4>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {importResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-sm text-red-600 p-2 bg-red-50 rounded"
                    >
                      <strong>Row {error.row}:</strong> {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importResult.successful > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                <p>
                  {importResult.successful} profile(s) imported successfully. They
                  will appear in the &quot;Pending Review&quot; tab.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

