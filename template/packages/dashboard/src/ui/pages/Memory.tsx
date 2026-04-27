import React, { useEffect, useState, useCallback } from 'react'
import { Icon } from '../components/Icon'

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

function relTime(ts: number): string {
  const ms = Date.now() - (ts > 1e12 ? ts : ts * 1000)
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function Memory() {
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
  const [showDecay, setShowDecay] = useState(true)
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

  useEffect(() => {
    fetch('/api/memories/decay-preview').then(r => r.json()).then(setDecay).catch(() => {})
  }, [memories])

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

  const semantic = stats?.sectors.find(s => s.sector === 'semantic')
  const episodic = stats?.sectors.find(s => s.sector === 'episodic')
  const dailyDecayPct = stats ? ((1 - stats.decayRate) * 100).toFixed(1) : '—'

  return (
    <>
      <div className="page-head">
        <div className="page-crumbs">
          <Icon name="database" size={13} />
          <span>Memory</span>
          <span className="sep">/</span>
          <span className="dim">{sector}</span>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => { setShowSnapshots(true); if (snapshotDates.length === 0) loadSnapshots() }}>
            <Icon name="calendar" size={13} /> Daily snapshots
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Icon name="pin" size={13} /> Pin memory
          </button>
        </div>
      </div>

      <div className="page-body">
        {error && (
          <div style={{ margin: '12px 20px 0' }}>
            <div className="toast error">
              <Icon name="alert" className="icon" />
              <span>{error}</span>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setError(null)}>
                <Icon name="x" size={11} />
              </button>
            </div>
          </div>
        )}

        {/* Stats strip */}
        <div className="mem-stats">
          <div className="stat">
            <div className="stat-label">Total memories</div>
            <div className="stat-value">{stats?.total ?? '—'}</div>
            <div className="stat-sub mono">live · all sectors</div>
          </div>
          <div className="stat">
            <div className="stat-label"><span className="tag-pill semantic">semantic</span></div>
            <div className="stat-value">{semantic?.count ?? '—'}</div>
            <div className="stat-sub">avg salience {semantic?.avg_salience.toFixed(2) ?? '—'}</div>
          </div>
          <div className="stat">
            <div className="stat-label"><span className="tag-pill episodic">episodic</span></div>
            <div className="stat-value">{episodic?.count ?? '—'}</div>
            <div className="stat-sub">avg salience {episodic?.avg_salience.toFixed(2) ?? '—'}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Decay rate</div>
            <div className="stat-value">{dailyDecayPct}%<span className="muted-text mono" style={{ fontSize: 12, fontWeight: 400 }}>/day</span></div>
            <div className="stat-sub mono">deletes &lt; {stats?.deleteThreshold ?? '—'}</div>
          </div>
        </div>

        {/* Decay preview accordion */}
        {decay && decay.count > 0 && (
          <div className={`mem-decay ${showDecay ? 'open' : ''}`}>
            <div className="mem-decay-head" onClick={() => setShowDecay(s => !s)}>
              <Icon name="chevron-right" className="chev" />
              <span><strong>{decay.count}</strong> memories will be deleted by the next sweep</span>
              <span className="muted-text mono" style={{ marginLeft: 'auto' }}>cutoff {decay.cutoff.toFixed(4)}</span>
            </div>
            {showDecay && (
              <div className="mem-decay-body">
                <table className="table">
                  <tbody>
                    {decay.sample.slice(0, 8).map(m => (
                      <tr key={m.id}>
                        <td style={{ width: 120 }}><span className={`tag-pill ${m.sector}`}>{m.sector}</span></td>
                        <td>{m.content.slice(0, 140)}{m.content.length > 140 ? '…' : ''}</td>
                        <td className="cell-mono" style={{ width: 80, color: 'var(--red)' }}>{m.salience.toFixed(3)}</td>
                      </tr>
                    ))}
                    {decay.sample.length === 0 && (
                      <tr><td colSpan={3} style={{ padding: 16, color: 'var(--muted)', fontSize: 11 }}>Nothing close to the cliff right now.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Toolbar */}
        <div className="mem-toolbar">
          <div className="search grow">
            <Icon name="search" className="icon" />
            <input
              className="input"
              placeholder="Search memories by content or topic…"
              value={q}
              onChange={e => { setQ(e.target.value); setPage(0) }}
            />
          </div>
          <div className="segmented">
            {(['all', 'semantic', 'episodic'] as const).map(s => (
              <button
                key={s}
                className={sector === s ? 'active' : ''}
                onClick={() => { setSector(s); setPage(0) }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <span className="muted-text mono" style={{ fontSize: 11, marginLeft: 8 }}>
            {total} matching · page {page + 1}
          </span>
        </div>

        {/* Table */}
        <div className="mem-table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Type</th>
                <th>Content</th>
                <th style={{ width: 140 }}>Topic</th>
                <th style={{ width: 90 }}>Salience</th>
                <th style={{ width: 130 }}>Created</th>
                <th style={{ width: 110, textAlign: 'right' }} />
              </tr>
            </thead>
            <tbody>
              {loading && memories.length === 0 && (<tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Loading…</td></tr>)}
              {!loading && memories.length === 0 && (<tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No memories match.</td></tr>)}
              {memories.map(m => {
                const isEditing = editingId === m.id
                return (
                  <tr key={m.id}>
                    <td>
                      {isEditing ? (
                        <select
                          value={editDraft.sector ?? m.sector}
                          onChange={e => setEditDraft(d => ({ ...d, sector: e.target.value as Memory['sector'] }))}
                          className="select"
                          style={{ height: 24, padding: '0 6px', fontSize: 11 }}
                        >
                          <option value="semantic">semantic</option>
                          <option value="episodic">episodic</option>
                        </select>
                      ) : (
                        <span className={`tag-pill ${m.sector}`}>{m.sector}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          className="cell-edit-input"
                          value={editDraft.content ?? m.content}
                          onChange={e => setEditDraft(d => ({ ...d, content: e.target.value }))}
                          autoFocus
                        />
                      ) : m.content}
                    </td>
                    <td className="cell-mono" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.topic_key ?? '—'}
                    </td>
                    <td className="cell-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editDraft.salience ?? m.salience}
                          onChange={e => setEditDraft(d => ({ ...d, salience: Number(e.target.value) }))}
                          className="cell-edit-input"
                          style={{ width: 70 }}
                        />
                      ) : m.salience.toFixed(3)}
                    </td>
                    <td className="cell-mono">{relTime(m.created_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions" style={{ opacity: isEditing ? 1 : undefined, justifyContent: 'flex-end' }}>
                        {isEditing ? (
                          <>
                            <button className="btn btn-icon" onClick={onSaveEdit} title="Save"><Icon name="check" size={13} /></button>
                            <button className="btn btn-icon btn-ghost" onClick={() => { setEditingId(null); setEditDraft({}) }} title="Cancel"><Icon name="x" size={13} /></button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-icon btn-ghost" onClick={() => { setEditingId(m.id); setEditDraft({}) }} title="Edit"><Icon name="edit" size={13} /></button>
                            <button className="btn btn-icon btn-ghost" onClick={() => onDelete(m.id)} title="Delete"><Icon name="trash" size={13} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {total > PAGE_SIZE && (
            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}>
              <span>{page * PAGE_SIZE + 1} – {Math.min((page + 1) * PAGE_SIZE, total)} of {total}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button className="btn btn-sm" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</button>
                <button className="btn btn-sm" disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>

        {showAdd && <PinMemoryModal onClose={() => setShowAdd(false)} onCreated={async () => { setShowAdd(false); await load() }} />}
        {showSnapshots && <SnapshotDrawer dates={snapshotDates} active={activeSnapshot} onPick={openSnapshot} onClose={() => setShowSnapshots(false)} onTriggerNow={triggerSnapshotNow} />}
      </div>
    </>
  )
}

function PinMemoryModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
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
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, content, sector, salience, topic_key: topicKey || undefined }),
      })
      if (!res.ok) throw new Error((await res.json()).error || res.statusText)
      onCreated()
    } catch (e) { setErr((e as Error).message); setSubmitting(false) }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">Pin a memory</div>
          <button className="btn btn-icon btn-ghost modal-close" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          {err && (
            <div className="toast error">
              <Icon name="alert" className="icon" />
              <span>{err}</span>
            </div>
          )}
          <div className="col" style={{ gap: 6 }}>
            <label className="muted-text mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sector</label>
            <div className="segmented" style={{ alignSelf: 'flex-start' }}>
              <button className={sector === 'semantic' ? 'active' : ''} onClick={() => setSector('semantic')}>Semantic</button>
              <button className={sector === 'episodic' ? 'active' : ''} onClick={() => setSector('episodic')}>Episodic</button>
            </div>
          </div>
          <div className="col" style={{ gap: 6 }}>
            <label className="muted-text mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Content</label>
            <textarea
              className="textarea"
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Something Luke should always remember…"
              autoFocus
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="col" style={{ gap: 6 }}>
              <label className="muted-text mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Salience</label>
              <input
                className="input"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={salience}
                onChange={e => setSalience(Number(e.target.value))}
              />
            </div>
            <div className="col" style={{ gap: 6 }}>
              <label className="muted-text mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Chat ID</label>
              <input
                className="input"
                value={chatId}
                onChange={e => setChatId(e.target.value)}
              />
            </div>
          </div>
          <div className="col" style={{ gap: 6 }}>
            <label className="muted-text mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Topic key (optional)</label>
            <input
              className="input"
              value={topicKey}
              onChange={e => setTopicKey(e.target.value)}
              placeholder="user_preferences"
            />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={submitting || !content.trim()}>
            <Icon name="pin" size={12} /> {submitting ? 'Pinning…' : 'Pin memory'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SnapshotDrawer({
  dates, active, onPick, onClose, onTriggerNow,
}: {
  dates: string[]
  active: { date: string; md: string } | null
  onPick: (d: string) => void
  onClose: () => void
  onTriggerNow: () => void
}) {
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <Icon name="calendar" size={14} />
          <div className="ch-name" style={{ fontWeight: 600, fontSize: 13 }}>Daily snapshots</div>
          <span className="muted-text mono" style={{ fontSize: 10 }}>captured on each decay sweep</span>
          <div style={{ marginLeft: 'auto' }} className="row">
            <button className="btn btn-sm" onClick={onTriggerNow}>Snapshot now</button>
            <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="x" /></button>
          </div>
        </div>
        <div className="drawer-body">
          <div className="drawer-list">
            {dates.length === 0 && <div className="empty-text" style={{ padding: 8 }}>No snapshots yet.</div>}
            {dates.map(d => (
              <div
                key={d}
                className={`drawer-list-item ${active?.date === d ? 'active' : ''}`}
                onClick={() => onPick(d)}
              >
                <div className="d-date">{d}</div>
              </div>
            ))}
          </div>
          <div className="drawer-content">
            {active ? (
              <>
                <div className="muted-text mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{active.date}</div>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-mono)', lineHeight: 1.65, margin: 0 }}>{active.md}</pre>
              </>
            ) : (
              <div className="muted-text" style={{ fontSize: 13 }}>Pick a date.</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
