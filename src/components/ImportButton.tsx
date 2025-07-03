'use client'

import React, { useState } from 'react'
import type { ImportResult } from '@/types/interfaces'

interface ImportButtonProps {
  collection?: string
  className?: string
  children?: React.ReactNode
  onSuccess?: (result: ImportResult) => void
  onError?: (error: Error) => void
}

export const ImportButton: React.FC<ImportButtonProps> = ({
  collection,
  className = '',
  children,
  onSuccess,
  onError,
}) => {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      if (collection) {
        formData.append('collection', collection)
      }

      // Get the base URL for the API
      const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || window.location.origin
      const importUrl = `${baseUrl}/api/import`

      const response = await fetch(importUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`)
      }

      const result = await response.json()
      setProgress(100)
      
      if (onSuccess) {
        onSuccess(result)
      }

      // Reset file input
      event.target.value = ''
      
    } catch (error) {
      console.error('Import error:', error)
      if (onError) {
        onError(error as Error)
      }
    } finally {
      setIsImporting(false)
      setProgress(0)
    }
  }

  return (
    <div className={`import-button-container ${className}`}>
      <label className="import-button">
        <input
          type="file"
          accept=".json,.csv,.xlsx,.xls"
          onChange={handleFileSelect}
          disabled={isImporting}
          style={{ display: 'none' }}
        />
        {children || (
          <span className="import-button-text">
            {isImporting ? 'Importing...' : 'Import Data'}
          </span>
        )}
      </label>
      
      {isImporting && (
        <div className="import-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}
    </div>
  )
}

export default ImportButton 