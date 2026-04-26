import React, { useEffect, useState } from 'react'
import Chat from './pages/Chat'
import Cron from './pages/Cron'
import Monitoring from './pages/Monitoring'

type Page = 'chat' | 'cron' | 'monitoring'

const STORAGE_KEY = 'nc-last-page'

function initialPage(): Page {
  if (typeof window === 'undefined') return 'chat'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'chat' || stored === 'cron' || stored === 'monitoring') return stored
  return 'chat'
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
        {nav('cron', 'Schedules')}
        {nav('monitoring', 'Health')}
      </aside>
      {page === 'chat' && <Chat />}
      {page === 'cron' && <Cron />}
      {page === 'monitoring' && <Monitoring />}
    </div>
  )
}
