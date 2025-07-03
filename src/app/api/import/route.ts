import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { CollectionData, ImportItemResult } from '@/types/interfaces'

export async function POST(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Check authentication
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const collection = formData.get('collection') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    if (!collection) {
      return NextResponse.json(
        { error: 'No collection specified' },
        { status: 400 }
      )
    }

    // Only support JSON for now
    const fileName = file.name
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    if (fileExtension !== 'json') {
      return NextResponse.json(
        { error: 'Only JSON files are supported at this time.' },
        { status: 400 }
      )
    }

    // Parse JSON
    const buffer = Buffer.from(await file.arrayBuffer())
    let data: CollectionData[]
    try {
      data = JSON.parse(buffer.toString())
    } catch (_err) {
      return NextResponse.json(
        { error: 'Invalid JSON file.' },
        { status: 400 }
      )
    }
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'JSON must be an array of objects.' },
        { status: 400 }
      )
    }

    // Import each item
    const results: ImportItemResult[] = []
    let successCount = 0
    let errorCount = 0
    for (const [i, item] of data.entries()) {
      try {
        const created = await payload.create({
          collection: collection as any,
          data: item,
          user,
        })
        results.push({ index: i, status: 'success', id: created.id })
        successCount++
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        results.push({ index: i, status: 'error', error: errorMessage })
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${successCount} items, ${errorCount} errors`,
      results,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        error: 'Import failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 