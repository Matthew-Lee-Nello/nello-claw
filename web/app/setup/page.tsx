'use client'

import Link from 'next/link'
import { useState } from 'react'
import { COURSE, Block } from '@/lib/course-content'

export default function SetupPage() {
  const [openModule, setOpenModule] = useState<string | null>(COURSE[0]?.id ?? null)
  const [openLesson, setOpenLesson] = useState<string | null>(COURSE[0]?.lessons[0]?.id ?? null)
  const [completed, setCompleted] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try { return new Set(JSON.parse(localStorage.getItem('nc-setup-completed') || '[]')) }
    catch { return new Set() }
  })

  const toggleComplete = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      try { localStorage.setItem('nc-setup-completed', JSON.stringify([...next])) } catch {}
      return next
    })
  }

  const totalLessons = COURSE.reduce((acc, m) => acc + m.lessons.length, 0)
  const doneCount = completed.size
  const pct = totalLessons === 0 ? 0 : Math.round((doneCount / totalLessons) * 100)

  const lesson = COURSE.flatMap(m => m.lessons).find(l => l.id === openLesson)
  const mod = COURSE.find(m => m.lessons.some(l => l.id === openLesson))

  return (
    <div className="setup-page">
      <header className="setup-topbar">
        <Link href="/" className="setup-brand">
          <span style={{ color: 'var(--accent)' }}>nello-claw</span>
          <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>· Setup Instructions</span>
        </Link>
        <nav className="setup-nav">
          <Link href="/wizard">Wizard</Link>
          <Link href="/audit">Audit</Link>
          <Link href="/docs">Docs</Link>
        </nav>
      </header>

      <div className="setup-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="progress-label">{doneCount} / {totalLessons} done</span>
      </div>

      <div className="setup-grid">
        <aside className="setup-toc">
          <div className="setup-toc-intro">
            <strong>Full setup walkthrough.</strong> Tick lessons off as you go. Saved to your browser.
          </div>
          {COURSE.map(m => (
            <div key={m.id} className="toc-module">
              <div
                className={`toc-module-header ${openModule === m.id ? 'active' : ''}`}
                onClick={() => setOpenModule(openModule === m.id ? null : m.id)}
              >
                <span className="toc-module-num">{m.number}</span>
                <span className="toc-module-title">{m.title}</span>
                <span className="toc-module-meta">{m.lessons.filter(l => completed.has(l.id)).length}/{m.lessons.length}</span>
              </div>
              {openModule === m.id && (
                <div className="toc-lessons">
                  {m.lessons.map(l => (
                    <div
                      key={l.id}
                      className={`toc-lesson ${openLesson === l.id ? 'active' : ''} ${completed.has(l.id) ? 'done' : ''}`}
                      onClick={() => { setOpenLesson(l.id); setOpenModule(m.id) }}
                    >
                      <span className="toc-check">{completed.has(l.id) ? '●' : '○'}</span>
                      {l.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        <main className="setup-content">
          {!lesson ? (
            <p style={{ color: 'var(--muted)' }}>Pick a lesson from the left.</p>
          ) : (
            <article>
              <div className="lesson-meta">{mod?.number}.{lesson.number} · {mod?.title}</div>
              <h1>{lesson.title}</h1>
              {lesson.duration && <div className="lesson-duration">{lesson.duration}</div>}
              <LessonBody body={lesson.body} />
              <div className="lesson-footer">
                <button
                  onClick={() => toggleComplete(lesson.id)}
                  className={completed.has(lesson.id) ? 'secondary' : ''}
                >
                  {completed.has(lesson.id) ? '✓ Done' : 'Mark done'}
                </button>
                <NextLessonButton currentLesson={lesson.id} setOpenLesson={setOpenLesson} setOpenModule={setOpenModule} />
              </div>
            </article>
          )}
        </main>
      </div>
    </div>
  )
}

function LessonBody({ body }: { body: Block[] }) {
  return (
    <div className="lesson-body">
      {body.map((block, i) => {
        if (block.type === 'p') return <p key={i}>{block.text}</p>
        if (block.type === 'h') return <h3 key={i}>{block.text}</h3>
        if (block.type === 'ul') return <ul key={i}>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
        if (block.type === 'ol') return <ol key={i}>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ol>
        if (block.type === 'code') return <pre key={i}><code>{block.text}</code></pre>
        if (block.type === 'callout') return (
          <div key={i} className={`callout callout-${block.tone || 'info'}`}>
            {block.title && <strong>{block.title}</strong>}
            <p>{block.text}</p>
          </div>
        )
        return null
      })}
    </div>
  )
}

function NextLessonButton({
  currentLesson,
  setOpenLesson,
  setOpenModule,
}: {
  currentLesson: string
  setOpenLesson: (id: string) => void
  setOpenModule: (id: string) => void
}) {
  const allLessons = COURSE.flatMap(m => m.lessons.map(l => ({ ...l, modId: m.id })))
  const idx = allLessons.findIndex(l => l.id === currentLesson)
  if (idx === -1 || idx === allLessons.length - 1) return null
  const next = allLessons[idx + 1]
  return (
    <button
      onClick={() => {
        setOpenLesson(next.id)
        setOpenModule(next.modId)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
    >
      Next: {next.title} →
    </button>
  )
}
