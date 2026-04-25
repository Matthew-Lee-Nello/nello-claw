import { NextResponse } from 'next/server'

export const runtime = 'edge'

const REPO = 'Matthew-Lee-Nello/nello-claw'
const REF = 'main'

const MAC_LAUNCHER = `#!/bin/bash
# nello-claw bootstrap loader (Mac/Linux). Pulls the real installer + runs it.
set -e
curl -fsSL https://raw.githubusercontent.com/${REPO}/${REF}/installer/install.sh | bash
`

const WIN_LAUNCHER = `# nello-claw bootstrap loader (Windows PowerShell). Pulls the real installer + runs it.
$ErrorActionPreference = 'Stop'
$script = Invoke-RestMethod -Uri 'https://raw.githubusercontent.com/${REPO}/${REF}/installer/install.ps1'
Invoke-Expression $script
`

/**
 * Serve the right installer based on platform:
 *   /i/mac    → install.sh
 *   /i/linux  → install.sh
 *   /i/win    → install.ps1
 */
export async function GET(_req: Request, ctx: { params: Promise<{ platform: string }> }) {
  const { platform } = await ctx.params
  const p = platform.toLowerCase()

  if (p === 'mac' || p === 'linux') {
    return new NextResponse(MAC_LAUNCHER, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  if (p === 'win' || p === 'windows') {
    return new NextResponse(WIN_LAUNCHER, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  return new NextResponse('Unknown platform. Use /i/mac, /i/win, or /i/linux.', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  })
}
