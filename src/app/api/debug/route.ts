import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasPayloadSecret: !!process.env.PAYLOAD_SECRET,
    hasPayloadApiKey: !!process.env.PAYLOAD_API_KEY,
    hasDatabaseUri: !!process.env.DATABASE_URI,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
} 