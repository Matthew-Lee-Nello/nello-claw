import React, { useEffect, useState, useRef } from 'react'
import { Icon } from '../components/Icon'

interface Stats {
  uptime_s: number
  memory_mb: number
  memory_rows: number
  scheduled_tasks: number
  sessions: number
  semantic?: number
  episodic?: number
  total_chats?: number
  total_messages?: number
}

interface Health {
  status: string
  uptime: number
  memoryUsage: { heapUsed: number; heapTotal: number; rss: number }
}

interface LogLine {
  level: string
  msg: string
  fields: Record<string, unknown>
  ts: number
}

function fmtUptime(s: number): string {
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function fmtMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(0)}`
}

function sparkPath(vals: number[]) {
  const w = 200, h = 28
  if (vals.length < 2) return { d: '', area: '', w, h }
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const range = max - min || 1
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - ((v - min) / range) * h])
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${d} L${w},${h} L0,${h} Z`
  return { d, area, w, h }
}

function fmtTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

export default function Monitoring() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [logs, setLogs] = useState<LogLine[]>([])
  const memHistory = useRef<number[]>([])
  const sessionsHistory = useRef<number[]>([])
  const memoriesHistory = useRef<number[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  // Polled stats
  useEffect(() => {
    const load = async () => {
      try {
        const [s, h] = await Promise.all([
          fetch('/api/monitoring/stats').then(r => r.json()),
          fetch('/api/monitoring/health').then(r => r.ok ? r.json() : null).catch(() => null),
        ])
        setStats(s)
        if (h) setHealth(h)
        memHistory.current = [...memHistory.current.slice(-23), s.memory_mb]
        memoriesHistory.current = [...memoriesHistory.current.slice(-23), s.memory_rows]
        sessionsHistory.current = [...sessionsHistory.current.slice(-23), s.sessions]
      } catch {}
    }
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  // Live log via WS
  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${window.location.host}/ws`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe-logs' }))
    }
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as { type: string; level?: string; msg?: string; fields?: Record<string, unknown>; ts?: number }
        if (msg.type === 'log' && msg.msg !== undefined && msg.ts !== undefined) {
          setLogs(prev => [...prev.slice(-199), {
            level: msg.level ?? 'info',
            msg: msg.msg ?? '',
            fields: msg.fields ?? {},
            ts: msg.ts ?? Date.now(),
          }])
        }
      } catch {}
    }
    return () => { try { ws.close() } catch {} }
  }, [])

  if (!stats) {
    return (
      <>
        <div className="page-head">
          <div className="page-crumbs">
            <Icon name="activity" size={13} />
            <span>Dashboard</span>
          </div>
        </div>
        <div className="page-body">
          <div className="empty">Loading…</div>
        </div>
      </>
    )
  }

  const memSpark = sparkPath(memHistory.current.length > 1 ? memHistory.current : [stats.memory_mb, stats.memory_mb])
  const memoriesSpark = sparkPath(memoriesHistory.current.length > 1 ? memoriesHistory.current : [stats.memory_rows, stats.memory_rows])
  const sessSpark = sparkPath(sessionsHistory.current.length > 1 ? sessionsHistory.current : [stats.sessions, stats.sessions])

  return (
    <>
      <div className="page-head">
        <div className="page-crumbs">
          <Icon name="activity" size={13} />
          <span>Dashboard</span>
          <span className="sep">/</span>
          <span className="dim">overview</span>
        </div>
        <div className="page-actions">
          <span className="muted-text mono" style={{ fontSize: 11 }}>
            <span className="dot sm green pulse" style={{ marginRight: 6, verticalAlign: 'middle' }} />
            live · 5s poll
          </span>
        </div>
      </div>

      <div className="page-body">
        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: '16px 20px 0' }}>
          <div className="stat">
            <div className="stat-label"><Icon name="clock" size={11} /> Uptime</div>
            <div className="stat-value">{fmtUptime(stats.uptime_s)}</div>
            <div className="stat-sub mono">
              <span className={`dot sm ${health?.status === 'ok' ? 'green pulse' : 'amber'}`} style={{ marginRight: 4 }} />
              {health?.status === 'ok' ? 'healthy' : 'check'}
            </div>
          </div>
          <div className="stat">
            <div className="stat-label"><Icon name="cpu" size={11} /> Sessions</div>
            <div className="stat-value">{stats.sessions}</div>
            <svg className="spark" viewBox={`0 0 ${sessSpark.w} ${sessSpark.h}`} preserveAspectRatio="none">
              <path className="area" d={sessSpark.area} />
              <path d={sessSpark.d} />
            </svg>
          </div>
          <div className="stat">
            <div className="stat-label"><Icon name="database" size={11} /> Memories</div>
            <div className="stat-value">{stats.memory_rows}</div>
            <svg className="spark" viewBox={`0 0 ${memoriesSpark.w} ${memoriesSpark.h}`} preserveAspectRatio="none">
              <path className="area" d={memoriesSpark.area} />
              <path d={memoriesSpark.d} />
            </svg>
          </div>
          <div className="stat">
            <div className="stat-label"><Icon name="clock" size={11} /> Schedules</div>
            <div className="stat-value">{stats.scheduled_tasks}</div>
            <div className="stat-sub mono">cron tasks</div>
          </div>
          <div className="stat">
            <div className="stat-label"><Icon name="memory" size={11} /> RAM</div>
            <div className="stat-value">{stats.memory_mb.toFixed(0)} <span className="muted-text mono" style={{ fontSize: 12, fontWeight: 400 }}>MB</span></div>
            <svg className="spark" viewBox={`0 0 ${memSpark.w} ${memSpark.h}`} preserveAspectRatio="none">
              <path className="area" d={memSpark.area} />
              <path d={memSpark.d} />
            </svg>
          </div>
        </div>

        {/* Health + Memory breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 20px 0' }}>
          <div className="card">
            <div className="row" style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <Icon name="activity" size={13} />
              <span style={{ fontWeight: 600, fontSize: 12 }}>System health</span>
            </div>
            <table className="table">
              <tbody>
                <tr>
                  <td className="mono" style={{ fontSize: 11 }}>status</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`spill ${health?.status === 'ok' ? 'green' : 'amber'}`}>
                      <span className={`dot sm ${health?.status === 'ok' ? 'green pulse' : 'amber'}`} />
                      {health?.status ?? 'unknown'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontSize: 11 }}>uptime</td>
                  <td className="cell-mono" style={{ textAlign: 'right' }}>{fmtUptime(stats.uptime_s)}</td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontSize: 11 }}>heap used</td>
                  <td className="cell-mono" style={{ textAlign: 'right' }}>{health ? `${fmtMB(health.memoryUsage.heapUsed)} MB` : '—'}</td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontSize: 11 }}>heap total</td>
                  <td className="cell-mono" style={{ textAlign: 'right' }}>{health ? `${fmtMB(health.memoryUsage.heapTotal)} MB` : '—'}</td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontSize: 11 }}>rss</td>
                  <td className="cell-mono" style={{ textAlign: 'right' }}>{health ? `${fmtMB(health.memoryUsage.rss)} MB` : '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="row" style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <Icon name="database" size={13} />
              <span style={{ fontWeight: 600, fontSize: 12 }}>Memory breakdown</span>
            </div>
            <table className="table">
              <tbody>
                <tr>
                  <td className="mono" style={{ fontSize: 11 }}>semantic</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="tag-pill semantic">{stats.semantic ?? '—'}</span>
                  </td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontSize: 11 }}>episodic</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="tag-pill episodic">{stats.episodic ?? '—'}</span>
                  </td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontSize: 11 }}>chats (active)</td>
                  <td className="cell-mono" style={{ textAlign: 'right' }}>{stats.total_chats ?? '—'}</td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontSize: 11 }}>messages</td>
                  <td className="cell-mono" style={{ textAlign: 'right' }}>{stats.total_messages ?? '—'}</td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontSize: 11 }}>process ram</td>
                  <td className="cell-mono" style={{ textAlign: 'right' }}>{stats.memory_mb.toFixed(1)} MB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Live log card */}
        <div className="mon-section">
          <h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="activity" size={11} /> Live log
              <span className="muted-text mono" style={{ fontSize: 10 }}>tail · {logs.length} of last 200</span>
              <span className="dot sm green pulse" style={{ marginLeft: 8 }} />
            </span>
          </h3>
          <div className="log-block" style={{ maxHeight: 320 }}>
            {logs.length === 0 ? (
              <div className="l-info" style={{ color: 'var(--muted)' }}>Waiting for log events…</div>
            ) : (
              logs.slice(-50).map((l, i) => (
                <div key={i}>
                  <span className="l-ts">{fmtTime(l.ts)}</span>
                  <span className={`l-${l.level === 'error' ? 'err' : l.level === 'warn' ? 'warn' : l.level === 'info' ? 'ok' : 'info'}`}>
                    [{l.level.toUpperCase()}]
                  </span>{' '}
                  <span className={
                    l.level === 'error' ? 'l-err' :
                    l.level === 'warn' ? 'l-warn' : 'l-info'
                  } style={{ whiteSpace: 'pre-wrap' }}>{l.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
