import { NextResponse } from 'next/server'

const INSTALL_SCRIPT = `#!/bin/bash
set -e
echo "nello-claw installer"
curl -fsSL https://raw.githubusercontent.com/Matthew-Lee-Nello/nello-claw/main/installer/install.sh | bash
`

export const runtime = 'edge'

/**
 * Serve the install.sh when user runs curl | bash.
 * The token identifies the wizard session for analytics only - the script is the same for everyone.
 * Real personalisation comes from ~/Downloads/nello-claw-bundle.json that the browser wrote.
 */
export async function GET(_req: Request, _ctx: { params: Promise<{ token: string }> }) {
  return new NextResponse(INSTALL_SCRIPT, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
