import React from 'react'
import AdminImportButton from './import-button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdminImportButton />
      {children}
    </>
  )
} 