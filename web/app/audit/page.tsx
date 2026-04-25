'use client'

import Link from 'next/link'
import { useState } from 'react'

const PROMPT = `Audit my Claude Code setup against nello-claw. Read https://raw.githubusercontent.com/Matthew-Lee-Nello/nello-claw/main/AUDIT_GUIDE.md and follow it. For each missing feature, ask me y/n before installing. Skip anything I already have.`

export default function AuditPage() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="hero">
      <h1>Already have <span>Claude Code</span>?</h1>
      <p style={{ fontSize: 18, color: 'var(--text)', marginBottom: 12 }}>
        Paste this into an open Claude Code session. It audits what you have vs the nello-claw stack,
        then asks you one y/n at a time before installing each missing piece.
      </p>
      <p>
        Works if you already have the Google MCP wired, or some skills installed, or a vault set up.
        Nothing gets overwritten without a backup.
      </p>

      <h2 style={{ marginTop: 40, fontSize: 18 }}>The prompt</h2>
      <div className="install-command" onClick={copy} style={{ cursor: 'pointer' }}>
        {PROMPT}
      </div>
      <button onClick={copy}>{copied ? 'Copied' : 'Copy to clipboard'}</button>

      <h2 style={{ marginTop: 48, fontSize: 18 }}>What happens</h2>
      <p>
        Claude clones the reference repo to <code>/tmp/nello-claw-ref</code>, reads your
        <code>~/.claude/settings.json</code>, <code>~/.mcp.json</code> and
        <code>~/.claude/skills/</code>, then prints a clear diff. You answer yes or no per item.
        It installs only what you approve and backs up anything it touches.
      </p>

      <h2 style={{ marginTop: 40, fontSize: 18 }}>If you want the full wizard flow instead</h2>
      <p>
        <Link href="/wizard">Start the fresh-install wizard →</Link>
      </p>
    </div>
  )
}
