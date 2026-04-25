import React, { useEffect, useState } from 'react'
import Chat from './pages/Chat'
import Cron from './pages/Cron'
import Monitoring from './pages/Monitoring'
import Courses from './pages/Courses'

type Page = 'chat' | 'courses' | 'cron' | 'monitoring'

const STORAGE_KEY = 'nc-last-page'

function initialPage(): Page {
  if (typeof window === 'undefined') return 'courses'
  // First-time users land on Courses (instant roadmap). Returning users land where they left.
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'chat' || stored === 'courses' || stored === 'cron' || stored === 'monitoring') return stored
  return 'courses'
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
        <h1>Command Centre</h1>
        {nav('courses', 'Get started')}
        {nav('chat', 'Chat')}
        {nav('cron', 'Schedules')}
        {nav('monitoring', 'Health')}
      </aside>
      {page === 'chat' && <Chat />}
      {page === 'courses' && <Courses />}
      {page === 'cron' && <Cron />}
      {page === 'monitoring' && <Monitoring />}
    </div>
  )
}
