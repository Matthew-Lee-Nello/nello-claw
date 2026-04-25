import React, { useEffect, useState } from 'react'

interface Task {
  id: string
  chat_id: string
  prompt: string
  schedule: string
  next_run: number
  status: 'active' | 'paused'
}

export default function Cron() {
  const [tasks, setTasks] = useState<Task[]>([])

  const load = () => fetch('/api/cron/tasks').then(r => r.json()).then(setTasks)

  useEffect(() => { load() }, [])

  const toggle = async (t: Task) => {
    await fetch(`/api/cron/tasks/${t.id}/${t.status === 'active' ? 'pause' : 'resume'}`, { method: 'POST' })
    load()
  }

  const del = async (t: Task) => {
    if (!confirm(`Delete task ${t.id}?`)) return
    await fetch(`/api/cron/tasks/${t.id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="page">
      <h2>Scheduled Tasks</h2>
      {tasks.length === 0 && <div style={{ color: 'var(--muted)' }}>No tasks. Create one via: <code>nc-schedule create "prompt" "0 9 * * *" CHAT_ID</code></div>}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Schedule</th>
            <th>Next run</th>
            <th>Prompt</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id}>
              <td><code>{t.id}</code></td>
              <td><span className={`badge ${t.status}`}>{t.status}</span></td>
              <td><code>{t.schedule}</code></td>
              <td>{new Date(t.next_run * 1000).toLocaleString()}</td>
              <td style={{ maxWidth: 400 }}>{t.prompt.slice(0, 80)}{t.prompt.length > 80 ? '…' : ''}</td>
              <td>
                <button onClick={() => toggle(t)}>{t.status === 'active' ? 'Pause' : 'Resume'}</button>{' '}
                <button onClick={() => del(t)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
