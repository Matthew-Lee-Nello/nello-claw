import React, { useState } from 'react'
import { COURSE, Module, Lesson } from '../course-content'

export default function Courses() {
  const [openModule, setOpenModule] = useState<string | null>(COURSE[0]?.id ?? null)
  const [openLesson, setOpenLesson] = useState<string | null>(COURSE[0]?.lessons[0]?.id ?? null)
  const [completed, setCompleted] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try { return new Set(JSON.parse(localStorage.getItem('nc-completed-lessons') || '[]')) }
    catch { return new Set() }
  })

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
        <h2>Course</h2>
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
