import React, { useEffect, useState } from 'react'
import Chat from './pages/Chat'
import Cron from './pages/Cron'
import Monitoring from './pages/Monitoring'
import Memory from './pages/Memory'
import DaemonStatus from './components/DaemonStatus'

type Page = 'chat' | 'cron' | 'monitoring' | 'memory'

const STORAGE_KEY = 'nc-last-page'
const VALID: Page[] = ['chat', 'cron', 'monitoring', 'memory']

function initialPage(): Page {
  if (typeof window === 'undefined') return 'chat'
  const stored = localStorage.getItem(STORAGE_KEY) as Page | null
  return stored && VALID.includes(stored) ? stored : 'chat'
}

export default function App() {
  const [page, setPage] = useState<Page>(initialPage)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, page) } catch {}
  }, [page])

  const nav = (p: Page, label: string) => (
    <div
      key={p}
      className={`nav-item ${page === p ? 'active' : ''}`}
      onClick={() => setPage(p)}
    >
      {label}
    </div>
  )

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Nello Claw</h1>
        {nav('chat', 'Chat')}
        {nav('memory', 'Memory')}
        {nav('cron', 'Schedules')}
        {nav('monitoring', 'Health')}
        <DaemonStatus />
      </aside>
      {page === 'chat' && <Chat />}
      {page === 'memory' && <Memory />}
      {page === 'cron' && <Cron />}
      {page === 'monitoring' && <Monitoring />}
    </div>
  )
}
