import React, { useState } from 'react'
import Chat from './pages/Chat'
import Cron from './pages/Cron'
import Monitoring from './pages/Monitoring'

type Page = 'chat' | 'cron' | 'monitoring'

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
        {nav('cron', 'Cron')}
        {nav('monitoring', 'Monitoring')}
      </aside>
      {page === 'chat' && <Chat />}
      {page === 'cron' && <Cron />}
      {page === 'monitoring' && <Monitoring />}
    </div>
  )
}
