import React, { useEffect, useState, useCallback } from 'react'

interface Memory {
  id: number
  chat_id: string
  topic_key: string | null
  content: string
  sector: 'semantic' | 'episodic'
  salience: number
  created_at: number
  accessed_at: number
}

interface Stats {
  total: number
  sectors: { sector: string; count: number; avg_salience: number; min_salience: number }[]
  decayRate: number
  deleteThreshold: number
}

interface DecayPreview {
  cutoff: number
  count: number
  sample: Memory[]
}

type SectorFilter = 'all' | 'semantic' | 'episodic'

const PAGE_SIZE = 50

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<Stats | null>(null)
  const [decay, setDecay] = useState<DecayPreview | null>(null)
  const [q, setQ] = useState('')
  const [sector, setSector] = useState<SectorFilter>('all')
  const [page, setPage] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<Memory>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [showDecay, setShowDecay] = useState(false)
  const [showSnapshots, setShowSnapshots] = useState(false)
  const [snapshotDates, setSnapshotDates] = useState<string[]>([])
  const [activeSnapshot, setActiveSnapshot] = useState<{ date: string; md: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ sector, limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) })
      if (q.trim()) params.set('q', q.trim())
      const [list, st] = await Promise.all([
        fetch(`/api/memories?${params}`).then(r => r.json()),
        fetch('/api/memories/stats').then(r => r.json()),
      ])
      setMemories(list.memories)
      setTotal(list.total)
      setStats(st)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [q, sector, page])

  useEffect(() => { load() }, [load])

  const refreshDecay = async () => {
    try { setDecay(await fetch('/api/memories/decay-preview').then(r => r.json())) } catch (e) { setError((e as Error).message) }
  }

  const loadSnapshots = async () => {
    try {
      const data = await fetch('/api/memories/snapshots').then(r => r.json())
      setSnapshotDates(data.dates)
      if (data.dates[0] && !activeSnapshot) await openSnapshot(data.dates[0])
    } catch (e) { setError((e as Error).message) }
  }

  const openSnapshot = async (date: string) => {
    try {
      const res = await fetch(`/api/memories/snapshots/${date}`)
      if (!res.ok) throw new Error(res.statusText)
      setActiveSnapshot({ date, md: await res.text() })
    } catch (e) { setError((e as Error).message) }
  }

  const triggerSnapshotNow = async () => {
    try {
      await fetch('/api/memories/snapshots', { method: 'POST' })
      await loadSnapshots()
    } catch (e) { setError((e as Error).message) }
  }

  const onDelete = async (id: number) => {
    if (!confirm('Delete this memory?')) return
    try { await fetch(`/api/memories/${id}`, { method: 'DELETE' }); await load() } catch (e) { setError((e as Error).message) }
  }

  const onSaveEdit = async () => {
    if (editingId == null) return
    try {
      await fetch(`/api/memories/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editDraft) })
      setEditingId(null)
      setEditDraft({})
      await load()
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <div className="page" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px 24px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Memory</h2>
        {stats && (
          <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 16 }}>
            <span><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{stats.total}</span> total</span>
            {stats.sectors.map(s => (
              <span key={s.sector}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s.count}</span> {s.sector} (avg {s.avg_salience.toFixed(2)})
              </span>
            ))}
            <span>decay {(stats.decayRate * 100).toFixed(0)}%/day, deletes &lt; {stats.deleteThreshold}</span>
          </div>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="secondary" onClick={() => { setShowSnapshots(s => !s); if (snapshotDates.length === 0) loadSnapshots() }}>Daily logs</button>
          <button className="secondary" onClick={() => { setShowDecay(s => !s); if (!decay) refreshDecay() }}>Decay preview</button>
          <button onClick={() => setShowAdd(true)}>+ Pin memory</button>
        </div>
      </header>

      {error && (
        <div style={{ padding: '8px 24px', background: 'rgba(255,80,80,0.1)', borderBottom: '1px solid rgba(255,80,80,0.3)', fontSize: 13, color: '#ff8080', display: 'flex', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="secondary" style={{ padding: '2px 8px', fontSize: 11 }}>×</button>
        </div>
      )}

      <div style={{ padding: '12px 24px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <input
          type="text"
          value={q}
          onChange={e => { setQ(e.target.value); setPage(0) }}
          placeholder="Full-text search..."
          style={{ flex: 1, maxWidth: 400, padding: '6px 10px', background: 'var(--panel)', border: '1px solid #2a2a2a', borderRadius: 6, color: 'var(--text)', fontSize: 13 }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'semantic', 'episodic'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setSector(s); setPage(0) }}
              className={sector === s ? '' : 'secondary'}
              style={{ textTransform: 'capitalize', fontSize: 12, padding: '6px 12px' }}
            >
              {s}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>{total} matching · page {page + 1}</span>
      </div>

      {showDecay && decay && (
        <div style={{ padding: '10px 24px', background: 'rgba(255,200,0,0.05)', borderBottom: '1px solid rgba(255,200,0,0.2)', fontSize: 12 }}>
          <div style={{ color: '#ffd54d', fontWeight: 600, marginBottom: 4 }}>Next sweep deletes {decay.count} memories (salience &lt; {decay.cutoff.toFixed(4)})</div>
          {decay.sample.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 11 }}>Nothing close to the cliff right now.</div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--muted)', maxHeight: 120, overflowY: 'auto' }}>
              {decay.sample.slice(0, 10).map(m => (
                <div key={m.id} style={{ padding: '2px 0' }}>
                  <span style={{ color: '#666' }}>#{m.id}</span> <span style={{ color: '#ffd54d' }}>{m.salience.toFixed(3)}</span> {m.content.slice(0, 100)}
                </div>
              ))}
              {decay.sample.length > 10 && <div style={{ color: '#666' }}>+{decay.sample.length - 10} more</div>}
            </div>
          )}
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: 13 }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--panel)', borderBottom: '1px solid #2a2a2a' }}>
            <tr style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
              <th style={{ padding: '8px 16px', textAlign: 'left', width: 60 }}>ID</th>
              <th style={{ padding: '8px', textAlign: 'left', width: 100 }}>Sector</th>
              <th style={{ padding: '8px', textAlign: 'left', width: 80 }}>Salience</th>
              <th style={{ padding: '8px', textAlign: 'left', width: 120 }}>Topic</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Content</th>
              <th style={{ padding: '8px', textAlign: 'left', width: 100 }}>Created</th>
              <th style={{ padding: '8px', textAlign: 'right', width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && memories.length === 0 && (<tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Loading...</td></tr>)}
            {!loading && memories.length === 0 && (<tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No memories match.</td></tr>)}
            {memories.map(m => {
              const isEditing = editingId === m.id
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '8px 16px', color: 'var(--muted)', fontFamily: 'monospace' }}>#{m.id}</td>
                  <td style={{ padding: 8 }}>
                    {isEditing ? (
                      <select value={editDraft.sector ?? m.sector} onChange={e => setEditDraft(d => ({ ...d, sector: e.target.value as Memory['sector'] }))} style={{ background: 'var(--bg)', border: '1px solid #2a2a2a', color: 'var(--text)', padding: '2px 6px', fontSize: 11, borderRadius: 4 }}>
                        <option value="semantic">semantic</option>
                        <option value="episodic">episodic</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: m.sector === 'semantic' ? 'var(--accent-dim)' : '#1f1f1f', color: m.sector === 'semantic' ? 'var(--accent)' : 'var(--muted)' }}>{m.sector}</span>
                    )}
                  </td>
                  <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 12 }}>
                    {isEditing ? (
                      <input type="number" step="0.1" value={editDraft.salience ?? m.salience} onChange={e => setEditDraft(d => ({ ...d, salience: Number(e.target.value) }))} style={{ width: 60, background: 'var(--bg)', border: '1px solid #2a2a2a', color: 'var(--text)', padding: '2px 4px' }} />
                    ) : m.salience.toFixed(3)}
                  </td>
                  <td style={{ padding: 8, color: 'var(--muted)', fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.topic_key ?? '-'}</td>
                  <td style={{ padding: 8 }}>
                    {isEditing ? (
                      <textarea value={editDraft.content ?? m.content} onChange={e => setEditDraft(d => ({ ...d, content: e.target.value }))} rows={3} style={{ width: '100%', background: 'var(--bg)', border: '1px solid #2a2a2a', color: 'var(--text)', padding: '4px 8px', fontSize: 12 }} />
                    ) : (
                      <span>{m.content}</span>
                    )}
                  </td>
                  <td style={{ padding: 8, color: 'var(--muted)', fontSize: 11 }}>{new Date(m.created_at * (m.created_at > 1e12 ? 1 : 1000)).toLocaleDateString()}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    {isEditing ? (
                      <>
                        <button onClick={onSaveEdit} style={{ padding: '4px 10px', fontSize: 11, marginRight: 4 }}>Save</button>
                        <button className="secondary" onClick={() => { setEditingId(null); setEditDraft({}) }} style={{ padding: '4px 10px', fontSize: 11 }}>×</button>
                      </>
                    ) : (
                      <>
                        <button className="secondary" onClick={() => { setEditingId(m.id); setEditDraft({}) }} style={{ padding: '4px 8px', fontSize: 11, marginRight: 4 }}>Edit</button>
                        <button className="secondary" onClick={() => onDelete(m.id)} style={{ padding: '4px 8px', fontSize: 11 }}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </main>

      {total > PAGE_SIZE && (
        <footer style={{ padding: '8px 24px', borderTop: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
          <span>{page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, total)} of {total}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="secondary" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} style={{ fontSize: 12 }}>Prev</button>
            <button className="secondary" disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)} style={{ fontSize: 12 }}>Next</button>
          </div>
        </footer>
      )}

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onCreated={async () => { setShowAdd(false); await load() }} />}
      {showSnapshots && <SnapshotsModal dates={snapshotDates} active={activeSnapshot} onPick={openSnapshot} onClose={() => setShowSnapshots(false)} onTriggerNow={triggerSnapshotNow} />}
    </div>
  )
}

function AddModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [chatId, setChatId] = useState('dashboard')
  const [content, setContent] = useState('')
  const [sector, setSector] = useState<'semantic' | 'episodic'>('semantic')
  const [salience, setSalience] = useState(2.0)
  const [topicKey, setTopicKey] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    setErr(null)
    try {
      const res = await fetch('/api/memories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, content, sector, salience, topic_key: topicKey || undefined }) })
      if (!res.ok) throw new Error((await res.json()).error || res.statusText)
      onCreated()
    } catch (e) { setErr((e as Error).message); setSubmitting(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={onClose}>
      <div style={{ background: 'var(--panel)', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, width: 480, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Pin a memory</h2>
        {err && <div style={{ color: '#ff8080', fontSize: 13, marginBottom: 12 }}>{err}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--muted)' }}>Content
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} style={{ width: '100%', marginTop: 4, background: 'var(--bg)', border: '1px solid #2a2a2a', color: 'var(--text)', padding: 8, borderRadius: 6 }} placeholder="Matt prefers terse code reviews..." />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Sector
              <select value={sector} onChange={e => setSector(e.target.value as 'semantic' | 'episodic')} style={{ width: '100%', marginTop: 4, background: 'var(--bg)', border: '1px solid #2a2a2a', color: 'var(--text)', padding: 8 }}>
                <option value="semantic">semantic</option>
                <option value="episodic">episodic</option>
              </select>
            </label>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Salience
              <input type="number" step="0.1" min="0" max="10" value={salience} onChange={e => setSalience(Number(e.target.value))} style={{ width: '100%', marginTop: 4, background: 'var(--bg)', border: '1px solid #2a2a2a', color: 'var(--text)', padding: 8 }} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Chat ID
              <input value={chatId} onChange={e => setChatId(e.target.value)} style={{ width: '100%', marginTop: 4, background: 'var(--bg)', border: '1px solid #2a2a2a', color: 'var(--text)', padding: 8 }} />
            </label>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Topic key (optional)
              <input value={topicKey} onChange={e => setTopicKey(e.target.value)} style={{ width: '100%', marginTop: 4, background: 'var(--bg)', border: '1px solid #2a2a2a', color: 'var(--text)', padding: 8 }} placeholder="user_preferences" />
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <button className="secondary" onClick={onClose}>Cancel</button>
          <button onClick={submit} disabled={submitting || !content.trim()}>{submitting ? 'Pinning...' : 'Pin memory'}</button>
        </div>
      </div>
    </div>
  )
}

function SnapshotsModal({ dates, active, onPick, onClose, onTriggerNow }: { dates: string[]; active: { date: string; md: string } | null; onPick: (d: string) => void; onClose: () => void; onTriggerNow: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={onClose}>
      <div style={{ background: 'var(--bg)', border: '1px solid #2a2a2a', borderRadius: 12, width: 1000, maxWidth: '95vw', height: '80vh', display: 'flex' }} onClick={e => e.stopPropagation()}>
        <aside style={{ width: 220, borderRight: '1px solid #2a2a2a', background: 'var(--panel)', overflowY: 'auto', padding: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Daily logs</h3>
            <button className="secondary" onClick={onClose} style={{ padding: '2px 8px', fontSize: 11 }}>×</button>
          </div>
          <button onClick={onTriggerNow} style={{ width: '100%', marginBottom: 12, padding: '6px 8px', fontSize: 11 }}>Snapshot now</button>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>Daemon writes one per day on decay sweep.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {dates.length === 0 && <li style={{ fontSize: 11, color: 'var(--muted)' }}>No snapshots yet.</li>}
            {dates.map(d => (
              <li key={d} style={{ marginBottom: 2 }}>
                <button
                  onClick={() => onPick(d)}
                  className="secondary"
                  style={{
                    width: '100%', textAlign: 'left', padding: '6px 8px', fontSize: 11,
                    background: active?.date === d ? 'var(--accent-dim)' : 'transparent',
                    color: active?.date === d ? 'var(--accent)' : 'var(--muted)',
                  }}
                >
                  {d}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {active ? (
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: 'var(--text)', fontFamily: 'monospace', lineHeight: 1.6 }}>{active.md}</pre>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Pick a date.</p>
          )}
        </main>
      </div>
    </div>
  )
}
