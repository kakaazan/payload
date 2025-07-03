'use client'

import React, { useState, useEffect } from 'react'

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    updateImportProgress?: (progress: number) => void
    showImportProgress?: (show: boolean) => void
  }
}

const AdminImportButton: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      // Default to 'videos' collection if not specified
      formData.append('collection', 'videos')

      // Get the base URL for the API
      const baseUrl = window.location.origin
      const importUrl = `${baseUrl}/api/import`

      const response = await fetch(importUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Import failed: ${response.statusText}`)
      }

      const result = await response.json()
      setProgress(100)
      
      // Show success message
      alert(`Import completed! ${result.message}`)
      
      // Reset file input
      target.value = ''
      
      // Refresh the page to show new data
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      console.error('Import error:', error)
      alert(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsImporting(false)
      setProgress(0)
    }
  }

  useEffect(() => {
    // Inject the import button into the Payload admin header
    const injectImportButton = () => {
      // Wait for Payload admin to load
      const header = document.querySelector('[data-payload-admin-header]') || 
                    document.querySelector('.payload-admin-header') ||
                    document.querySelector('header') ||
                    document.querySelector('.header')
      
      if (header && !document.getElementById('custom-import-button')) {
        const importButtonContainer = document.createElement('div')
        importButtonContainer.id = 'custom-import-button'
        importButtonContainer.style.cssText = `
          position: absolute;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 1000;
        `
        
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.style.display = 'none'
        input.id = 'admin-import-file'
        
        const button = document.createElement('button')
        button.innerHTML = '📁 Import Data'
        button.style.cssText = `
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          padding: 8px 12px;
          background-color: #6366f1;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          height: auto;
          min-width: auto;
          font-family: inherit;
        `
        
        input.addEventListener('change', handleFileSelect)
        button.addEventListener('click', () => input.click())
        
        importButtonContainer.appendChild(input)
        importButtonContainer.appendChild(button)
        header.appendChild(importButtonContainer)
        
        // Add progress bar container
        const progressContainer = document.createElement('div')
        progressContainer.id = 'import-progress'
        progressContainer.style.cssText = `
          display: none;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #666;
        `
        
        const progressBar = document.createElement('div')
        progressBar.style.cssText = `
          width: 60px;
          height: 4px;
          background-color: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        `
        
        const progressFill = document.createElement('div')
        progressFill.style.cssText = `
          width: 0%;
          height: 100%;
          background-color: #10b981;
          transition: width 0.3s ease;
        `
        
        const progressText = document.createElement('span')
        progressText.textContent = '0%'
        
        progressBar.appendChild(progressFill)
        progressContainer.appendChild(progressBar)
        progressContainer.appendChild(progressText)
        importButtonContainer.appendChild(progressContainer)
        
        // Store references for updates
        window.updateImportProgress = (progress: number) => {
          progressFill.style.width = `${progress}%`
          progressText.textContent = `${progress}%`
        }
        
        window.showImportProgress = (show: boolean) => {
          progressContainer.style.display = show ? 'flex' : 'none'
          button.disabled = show
          button.style.opacity = show ? '0.6' : '1'
          button.style.cursor = show ? 'not-allowed' : 'pointer'
        }
      }
    }
    
    // Try to inject immediately
    injectImportButton()
    
    // Also try after a delay to ensure Payload admin is loaded
    const timer = setTimeout(injectImportButton, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // Update progress when state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.updateImportProgress) {
      window.updateImportProgress(progress)
    }
  }, [progress])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.showImportProgress) {
      window.showImportProgress(isImporting)
    }
  }, [isImporting])

  return null // This component doesn't render anything visible
}

export default AdminImportButton 