import React, { useState } from 'react'
import Chat from './pages/Chat'
import Cron from './pages/Cron'
import Monitoring from './pages/Monitoring'
import Courses from './pages/Courses'

type Page = 'chat' | 'courses' | 'cron' | 'monitoring'

export default function App() {
  const [page, setPage] = useState<Page>('chat')

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
        <h1>NELLO-CLAW</h1>
        {nav('chat', 'Chat')}
        {nav('courses', 'Courses')}
        {nav('cron', 'Cron')}
        {nav('monitoring', 'Monitoring')}
      </aside>
      {page === 'chat' && <Chat />}
      {page === 'courses' && <Courses />}
      {page === 'cron' && <Cron />}
      {page === 'monitoring' && <Monitoring />}
    </div>
  )
}
