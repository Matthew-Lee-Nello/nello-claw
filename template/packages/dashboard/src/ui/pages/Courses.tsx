import React, { useState } from 'react'
import { COURSE, Module, Lesson } from '../course-content'

// Dashboard is loaded AFTER install completes. M1-M4 (install wizard, keys, paste prompt)
// are pre-install lessons - already done by the time the user sees this. Default to M5
// "Connect your phone" since that is the first post-install action they need to take.
const POST_INSTALL_START_MODULE = 'm5'
const POST_INSTALL_START_LESSON = 'm5-l1'

export default function Courses() {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try { return new Set(JSON.parse(localStorage.getItem('nc-completed-lessons') || '[]')) }
    catch { return new Set() }
  })

  // First incomplete lesson, OR the post-install start point if nothing done yet.
  function firstIncomplete(done: Set<string>): { module: string; lesson: string } {
    // If user has not started M5 yet, jump to it (skip the pre-install modules they already did)
    const startIdx = COURSE.findIndex(m => m.id === POST_INSTALL_START_MODULE)
    if (startIdx >= 0) {
      for (let i = startIdx; i < COURSE.length; i++) {
        const mod = COURSE[i]
        for (const l of mod.lessons) if (!done.has(l.id)) return { module: mod.id, lesson: l.id }
      }
    }
    return { module: POST_INSTALL_START_MODULE, lesson: POST_INSTALL_START_LESSON }
  }

  const start = firstIncomplete(completed)
  const [openModule, setOpenModule] = useState<string | null>(start.module)
  const [openLesson, setOpenLesson] = useState<string | null>(start.lesson)

  const toggleComplete = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      try { localStorage.setItem('nc-completed-lessons', JSON.stringify([...next])) } catch {}
      return next
    })
  }

  const totalLessons = COURSE.reduce((acc, m) => acc + m.lessons.length, 0)
  const doneCount = completed.size
  const pct = totalLessons === 0 ? 0 : Math.round((doneCount / totalLessons) * 100)

  return (
    <div className="page courses">
      <div className="course-header">
        <div>
          <h2>Welcome to your Command Centre</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
            Your assistant is running. Tick lessons off as you go - your progress is saved.
          </p>
        </div>
        <div className="course-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="progress-label">{doneCount} / {totalLessons} lessons</span>
        </div>
      </div>

      <div className="course-grid">
        <aside className="course-toc">
          {COURSE.map(mod => (
            <div key={mod.id} className="toc-module">
              <div
                className={`toc-module-header ${openModule === mod.id ? 'active' : ''}`}
                onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}
              >
                <span className="toc-module-num">{mod.number}</span>
                <span className="toc-module-title">{mod.title}</span>
                <span className="toc-module-meta">{mod.lessons.filter(l => completed.has(l.id)).length}/{mod.lessons.length}</span>
              </div>
              {openModule === mod.id && (
                <div className="toc-lessons">
                  {mod.lessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className={`toc-lesson ${openLesson === lesson.id ? 'active' : ''} ${completed.has(lesson.id) ? 'done' : ''}`}
                      onClick={() => setOpenLesson(lesson.id)}
                    >
                      <span className="toc-check">{completed.has(lesson.id) ? '●' : '○'}</span>
                      {lesson.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        <main className="course-content">
          {(() => {
            const lesson = COURSE.flatMap(m => m.lessons).find(l => l.id === openLesson)
            if (!lesson) return <p style={{ color: 'var(--muted)' }}>Pick a lesson from the left.</p>
            const mod = COURSE.find(m => m.lessons.some(l => l.id === openLesson))
            return (
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
                </div>
              </article>
            )
          })()}
        </main>
      </div>
    </div>
  )
}

function LessonBody({ body }: { body: Lesson['body'] }) {
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
