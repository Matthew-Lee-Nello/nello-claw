'use client'

import { useState } from 'react'
import { useWizard } from '@/lib/store'

const MAC_ONELINER = 'curl -fsSL https://labs.nello.gg/i/mac | bash'
const WIN_ONELINER = 'irm https://labs.nello.gg/i/win | iex'

const FALLBACK_PROMPT = `Install nello-claw. My bundle is at ~/Downloads/nello-claw-bundle.json. Read https://raw.githubusercontent.com/Matthew-Lee-Nello/nello-claw/main/INSTALL_GUIDE.md and follow every step.`

const EXTRA_ABILITIES = [
  { id: 'mcp-builder',        label: 'Help me build new connections',           desc: 'Walks you through plugging in any new service.' },
  { id: 'mcp-implement',      label: 'Help me wire connections I find',         desc: 'Set up someone else\'s connection in under a minute.' },
  { id: 'process-transcript', label: 'Turn meeting transcripts into notes',     desc: 'Drop in a transcript, get back tidy notes + action items.' },
  { id: 'process-calls',      label: 'Turn call recordings into notes',         desc: 'Drop in audio or video, get back transcript + summary + actions.' },
]

export default function Screen7Finish() {
  const { bundle, update } = useWizard()
  const [compiling, setCompiling] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const toggleAbility = (id: string) => {
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
      <h2>7. Last bits</h2>
      <p className="intro">A few choices about how your assistant runs, then we hand you the install command.</p>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.installTelegram} onChange={e => update({ installTelegram: e.target.checked })} />
          {' '}Text and voice your assistant from Telegram
        </label>
        <div className="panel-help">Send a message from anywhere, get an answer back. Works while you are away from your computer.</div>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.installDashboard} onChange={e => update({ installDashboard: e.target.checked })} />
          {' '}Personal chat hub on your Mac
        </label>
        <div className="panel-help">Your own private chat window at <code>localhost:3000</code>. No prompts, no permission walls - your assistant just does what you ask.</div>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.installLaunchAgent} onChange={e => update({ installLaunchAgent: e.target.checked })} />
          {' '}Auto-start when I turn on my Mac
        </label>
        <div className="panel-help">Your assistant boots up automatically. Always ready.</div>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.enableMorningBrief} onChange={e => update({ enableMorningBrief: e.target.checked })} />
          {' '}Morning briefing every day at 9am
        </label>
        {bundle.enableMorningBrief && (
          <>
            <textarea
              value={bundle.morningBriefPrompt}
              onChange={e => update({ morningBriefPrompt: e.target.value })}
              style={{ marginTop: 8 }}
              placeholder="What you want your assistant to brief you on each morning"
            />
            <input
              value={bundle.morningBriefCron}
              onChange={e => update({ morningBriefCron: e.target.value })}
              style={{ marginTop: 8 }}
              placeholder="0 9 * * *"
            />
            <div className="panel-help">Default is 9am local time. The format above is cron - leave it as is unless you know what you are doing.</div>
          </>
        )}
      </div>

      <div className="field">
        <label>Voice</label>
        <select value={bundle.voiceSource} onChange={e => update({ voiceSource: e.target.value as any })}>
          <option value="online">Online (free, fast, needs Groq key)</option>
          <option value="local">Local (no internet needed, free forever)</option>
          <option value="off">Voice off</option>
        </select>
        <div className="panel-help">How your assistant understands voice notes. Online is easier, local is fully private.</div>
      </div>

      <div className="field">
        <label>Extra abilities (optional)</label>
        {EXTRA_ABILITIES.map(s => (
          <label key={s.id} style={{ display: 'block', margin: '8px 0' }}>
            <input type="checkbox" checked={bundle.optionalSkills.includes(s.id)} onChange={() => toggleAbility(s.id)} />
            {' '}{s.label} <span style={{ color: 'var(--muted)', fontSize: 12 }}>- {s.desc}</span>
          </label>
        ))}
      </div>

      <div className="nav-buttons">
        <button className="secondary" onClick={() => window.history.back()}>Back</button>
        <button onClick={compileAndDownload} disabled={compiling}>
          {compiling ? 'Building...' : 'Build my assistant'}
        </button>
      </div>

      {token && (() => {
        const isWin = bundle.platform === 'windows'
        const oneliner = isWin ? WIN_ONELINER : MAC_ONELINER
        const terminalName = isWin ? 'PowerShell' : 'Terminal'
        const terminalHint = isWin
          ? 'Press the Windows key, type "PowerShell", hit Enter.'
          : 'Press Cmd+Space, type "Terminal", hit Enter.'

        return (
          <div style={{ marginTop: 32 }}>
            <h3>Last step</h3>
            <p>
              Your setup downloaded to <code>~/Downloads/nello-claw-bundle.json</code>.
              Open <strong>{terminalName}</strong> and paste this one line:
            </p>
            <div
              className="install-command"
              onClick={() => { navigator.clipboard.writeText(oneliner); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              title="Click to copy"
              style={{ cursor: 'pointer' }}
            >
              {oneliner}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(oneliner); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
              {copied ? 'Copied' : 'Copy to clipboard'}
            </button>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 16 }}>
              {terminalHint} Paste, hit Enter, type your password once when asked.
              The installer auto-installs anything you are missing (Node, Git, etc),
              sets everything up, and opens your dashboard. About 5 minutes.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>
              When the dashboard opens, send a message to your Telegram bot to finish.
              That last step links your phone to your assistant.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 24 }}>
              Already have Claude Code installed? You can paste this prompt instead:{' '}
              <code style={{ wordBreak: 'break-all' }}>{FALLBACK_PROMPT}</code>
            </p>
          </div>
        )
      })()}
    </div>
  )
}
