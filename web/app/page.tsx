'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useWizard } from '@/lib/store'
import type { Platform } from '@/lib/types'

export default function Landing() {
  const { update } = useWizard()
  const [detected, setDetected] = useState<Platform>('mac')

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    const p: Platform = ua.includes('mac') ? 'mac' : ua.includes('win') ? 'windows' : 'linux'
    setDetected(p)
    update({ platform: p })
  }, [update])

  const pick = (p: Platform) => {
    update({ platform: p })
  }

  return (
    <div className="hero">
      <h1><span>nello-claw</span></h1>
      <p style={{ fontSize: 24, color: 'var(--text)', marginBottom: 16, lineHeight: 1.3 }}>
        Your executive AI assistant. One that knows everything about you, and just does the job.
      </p>
      <p>
        Answer seven quick questions. Connect your accounts. Get an assistant that handles your
        inbox, your calendar, your notes, your follow-ups, your daily briefings - the admin
        work you do not want to do anymore.
      </p>

      <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: 'var(--text)', marginTop: 24 }}>
        <li>Reads and writes your Gmail, Drive, Docs, Calendar</li>
        <li>Texts you from anywhere - reply by message or voice</li>
        <li>Remembers your projects, clients, decisions, preferences</li>
        <li>Runs your morning briefing while you sleep</li>
        <li>Picks up your writing style and matches it</li>
      </ul>

      <p style={{ marginTop: 24, color: 'var(--muted)' }}>
        Setup takes about ten minutes. Your assistant lives on your own computer. Your keys, notes
        and conversations stay on your machine - never on our servers.
      </p>

      <h2 style={{ fontSize: 16, color: 'var(--muted)', marginTop: 40, marginBottom: 12, fontWeight: 500 }}>
        Pick your computer ({detected === 'mac' ? 'we think you are on Mac' : detected === 'windows' ? 'we think you are on Windows' : 'we think you are on Linux'})
      </h2>
      <div className="cta">
        <Link href="/wizard" onClick={() => pick('mac')}>
          <button>Set up on Mac</button>
        </Link>
        <Link href="/wizard" onClick={() => pick('windows')}>
          <button className="secondary">Set up on Windows</button>
        </Link>
      </div>

      <div style={{ marginTop: 32 }}>
        <Link href="/audit"><button className="secondary">I already have a setup</button></Link>
      </div>

      <p style={{ marginTop: 48, fontSize: 13 }}>
        <Link href="/docs">How it works →</Link>
      </p>
    </div>
  )
}
