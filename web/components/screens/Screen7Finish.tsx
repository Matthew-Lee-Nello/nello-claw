'use client'

import { useEffect, useState } from 'react'
import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

const PASTE_PROMPT = `Install nello-claw. My bundle is at ~/Downloads/nello-claw-bundle.json. Read https://raw.githubusercontent.com/Matthew-Lee-Nello/nello-claw/main/INSTALL_GUIDE.md and follow every step. Ask me for confirmation before anything destructive.`

const OPTIONAL_SKILLS = [
  { id: 'mcp-builder',        label: 'mcp-builder',        desc: 'Guide for writing new MCP servers' },
  { id: 'mcp-implement',      label: 'mcp-implement',      desc: 'Wire existing MCPs into your config' },
  { id: 'process-transcript', label: 'process-transcript', desc: 'Turn a transcript into vault notes' },
  { id: 'process-calls',      label: 'process-calls',      desc: 'Turn a call recording into vault notes' },
]

export default function Screen7Finish() {
  const { bundle, update } = useWizard()
  const [compiling, setCompiling] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const toggleOptionalSkill = (id: string) => {
    const list = bundle.optionalSkills
    update({ optionalSkills: list.includes(id) ? list.filter(x => x !== id) : [...list, id] })
  }

  const compileAndDownload = async () => {
    setCompiling(true)
    try {
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'nello-claw-bundle.json'
      a.click()
      URL.revokeObjectURL(url)

      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta: { at: Date.now() } }),
      })
      const data = await res.json()
      setToken(data.token)
    } finally {
      setCompiling(false)
    }
  }

  return (
    <div className="screen">
      <h2>7. Surfaces & Finish</h2>
      <p className="intro">Last pass. Pick what surfaces you want installed, enable autostart, then compile.</p>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.installTelegram} onChange={e => update({ installTelegram: e.target.checked })} />
          {' '}Install Telegram bot daemon
        </label>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.installDashboard} onChange={e => update({ installDashboard: e.target.checked })} />
          {' '}Install web dashboard at localhost:3000 (bypass permissions)
        </label>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.installLaunchAgent} onChange={e => update({ installLaunchAgent: e.target.checked })} />
          {' '}Auto-start on login (LaunchAgent on macOS)
        </label>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.enableMorningBrief} onChange={e => update({ enableMorningBrief: e.target.checked })} />
          {' '}Daily morning brief at 09:00 local
        </label>
        {bundle.enableMorningBrief && (
          <>
            <textarea
              value={bundle.morningBriefPrompt}
              onChange={e => update({ morningBriefPrompt: e.target.value })}
              style={{ marginTop: 8 }}
            />
            <input
              value={bundle.morningBriefCron}
              onChange={e => update({ morningBriefCron: e.target.value })}
              style={{ marginTop: 8 }}
              placeholder="0 9 * * *"
            />
          </>
        )}
      </div>

      <div className="field">
        <label>Voice source</label>
        <select value={bundle.voiceSource} onChange={e => update({ voiceSource: e.target.value as any })}>
          <option value="online">Online (Groq STT + ElevenLabs TTS)</option>
          <option value="local">Local (mlx-whisper + Piper, no API cost)</option>
          <option value="off">Off</option>
        </select>
      </div>

      <div className="field">
        <label>Optional skills to add on top of the default pack</label>
        {OPTIONAL_SKILLS.map(s => (
          <label key={s.id} style={{ display: 'block', margin: '6px 0' }}>
            <input type="checkbox" checked={bundle.optionalSkills.includes(s.id)} onChange={() => toggleOptionalSkill(s.id)} />
            {' '}{s.label} <span style={{ color: 'var(--muted)', fontSize: 12 }}>- {s.desc}</span>
          </label>
        ))}
      </div>

      <div className="nav-buttons">
        <button className="secondary" onClick={() => window.history.back()}>Back</button>
        <button onClick={compileAndDownload} disabled={compiling}>
          {compiling ? 'Compiling…' : 'Build My Brain'}
        </button>
      </div>

      {token && (
        <div style={{ marginTop: 32 }}>
          <h3>Install it</h3>
          <p>Bundle downloaded to <code>~/Downloads/nello-claw-bundle.json</code>. Open Claude Code and paste:</p>
          <div
            className="install-command"
            onClick={() => { navigator.clipboard.writeText(PASTE_PROMPT) }}
            title="Click to copy"
            style={{ cursor: 'pointer' }}
          >
            {PASTE_PROMPT}
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            Claude reads the install guide from GitHub, clones the repo, runs the bootstrap,
            wires Telegram + dashboard + LaunchAgent, and confirms it's all green.
            Your keys never uploaded anywhere - they stayed on your machine.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>
            Prefer Terminal bash one-liner instead? <code>curl -fsSL https://labs.nello.gg/i/{token} | bash</code>
          </p>
        </div>
      )}
    </div>
  )
}
