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
      <h1>Already running <span>your assistant</span>?</h1>
      <p style={{ fontSize: 18, color: 'var(--text)', marginBottom: 12 }}>
        Paste this one line into your Claude Code session. Your assistant will check what
        is already in place, then offer to add the missing pieces one at a time.
      </p>
      <p>
        It works if you have already connected Gmail, or installed a few abilities, or set
        up your notes. Nothing gets overwritten without making a backup first.
      </p>

      <h2 style={{ marginTop: 40, fontSize: 18 }}>Copy this</h2>
      <div className="install-command" onClick={copy} style={{ cursor: 'pointer' }}>
        {PROMPT}
      </div>
      <button onClick={copy}>{copied ? 'Copied' : 'Copy to clipboard'}</button>

      <h2 style={{ marginTop: 48, fontSize: 18 }}>What happens next</h2>
      <p>
        Your assistant compares your current setup to a complete one, prints a clear list of
        what is missing, and asks you yes or no for each item. You stay in control. If you
        say no to anything, it gets skipped. If you say yes, it gets added straight away.
      </p>

      <h2 style={{ marginTop: 32, fontSize: 18 }}>If you have not started yet</h2>
      <p>
        <Link href="/wizard">Set up your assistant from scratch →</Link>
      </p>
    </div>
  )
}
