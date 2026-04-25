import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export const runtime = 'edge'

/**
 * Issue a signed install token.
 * The actual bundle (with API keys) is NOT sent to the server.
 * This endpoint only gives the user a unique install-script URL.
 */
export async function POST(_req: Request) {
  const token = nanoid(16)
  return NextResponse.json({
    token,
    installUrl: `/i/${token}`,
    expires: Date.now() + 1000 * 60 * 60 * 24,
  })
}
