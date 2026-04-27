import React, { useEffect, useState, useCallback } from 'react'
import { Icon, type IconName } from './Icon'

interface BotState {
  configured: boolean
  running: boolean
  paused: boolean
  lastError: string | null
}

interface TelegramState extends BotState {
  chatIdConfigured: boolean
  username: string | null
}

interface WebexState extends BotState {
  emailsConfigured: boolean
}

interface DaemonsResponse {
  telegram: TelegramState
  webex?: WebexState
}

const POLL_MS = 5000

type Status = 'running' | 'paused' | 'error' | 'idle' | 'off'

function statusOf(s: BotState | undefined): Status {
  if (!s || !s.configured) return 'off'
  if (s.lastError) return 'error'
  if (s.running) return 'running'
  if (s.paused) return 'paused'
  return 'idle'
}

function dotClass(status: Status): string {
  if (status === 'running') return 'green pulse'
  if (status === 'paused') return 'amber'
  if (status === 'error') return 'red'
  return ''
}

export default function DaemonStatus() {
  const [data, setData] = useState<DaemonsResponse | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/daemons')
      if (res.ok) setData(await res.json())
    } catch {
      // keep last known state
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, POLL_MS)
    return () => clearInterval(t)
  }, [load])

  if (!data) return null

  const act = async (kind: 'telegram' | 'webex', action: 'start' | 'stop' | 'reboot') => {
    setBusy(`${kind}-${action}`)
    try {
      if (action === 'reboot') {
        await fetch(`/api/daemons/${kind}/stop`, { method: 'POST' })
        await new Promise(r => setTimeout(r, 400))
        await fetch(`/api/daemons/${kind}/start`, { method: 'POST' })
      } else {
        await fetch(`/api/daemons/${kind}/${action}`, { method: 'POST' })
      }
      await load()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="daemon-pill" style={{ gap: 6 }}>
      <DaemonRow
        kind="telegram"
        label="telegram"
        icon="telegram"
        state={data.telegram}
        busy={busy}
        onAct={act}
      />
      {data.webex && (
        <DaemonRow
          kind="webex"
          label="webex"
          icon="webex"
          state={data.webex}
          busy={busy}
          onAct={act}
        />
      )}
    </div>
  )
}

function DaemonRow({
  kind, label, icon, state, busy, onAct,
}: {
  kind: 'telegram' | 'webex'
  label: string
  icon: IconName
  state: BotState
  busy: string | null
  onAct: (kind: 'telegram' | 'webex', action: 'start' | 'stop' | 'reboot') => void
}) {
  const status = statusOf(state)
  const isRunning = status === 'running'

  return (
    <div className="col" style={{ gap: 6 }} title={state.lastError ?? undefined}>
      <div className="row" style={{ gap: 6, fontSize: 11, color: 'var(--dim)' }}>
        <span className={`dot sm ${dotClass(status)}`} />
        <Icon name={icon} size={11} />
        <span className="mono">{label}</span>
        <span className="muted-text mono" style={{ marginLeft: 'auto', fontSize: 10 }}>{status}</span>
      </div>
      <div className="row" style={{ gap: 4 }}>
        <button
          className={`btn btn-sm ${isRunning ? '' : 'btn-primary'}`}
          style={{ flex: 1, justifyContent: 'center', height: 22 }}
          disabled={!state.configured || isRunning || busy != null}
          onClick={() => onAct(kind, 'start')}
        >
          <Icon name="play" size={10} /> Start
        </button>
        <button
          className="btn btn-sm"
          style={{ flex: 1, justifyContent: 'center', height: 22 }}
          disabled={!state.configured || !isRunning || busy != null}
          onClick={() => onAct(kind, 'stop')}
        >
          <Icon name="stop" size={10} /> Stop
        </button>
        <button
          className="btn btn-sm"
          style={{ flex: 1, justifyContent: 'center', height: 22 }}
          disabled={!state.configured || busy != null}
          onClick={() => onAct(kind, 'reboot')}
        >
          <Icon name="zap" size={10} /> Reboot
        </button>
      </div>
    </div>
  )
}
