import React, { useEffect, useState } from 'react'

interface Stats {
  uptime_s: number
  memory_mb: number
  memory_rows: number
  scheduled_tasks: number
  sessions: number
}

export default function Monitoring() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const load = () => fetch('/api/monitoring/stats').then(r => r.json()).then(setStats)
    load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [])

  if (!stats) return <div className="page">Loading…</div>

  const uptimeMin = (stats.uptime_s / 60).toFixed(1)

  return (
    <div className="page">
      <h2>System Health</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div className="card"><h3>Uptime</h3><div className="value">{uptimeMin} min</div></div>
        <div className="card"><h3>Memory</h3><div className="value">{stats.memory_mb.toFixed(0)} MB</div></div>
        <div className="card"><h3>Memory rows</h3><div className="value">{stats.memory_rows}</div></div>
        <div className="card"><h3>Scheduled tasks</h3><div className="value">{stats.scheduled_tasks}</div></div>
        <div className="card"><h3>Sessions</h3><div className="value">{stats.sessions}</div></div>
      </div>
    </div>
  )
}
