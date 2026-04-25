'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

const TOOL_SUGGESTIONS = ['GHL', 'Notion', 'HubSpot', 'Airtable', 'Figma', 'Zapier', 'Make', 'n8n', 'Linear', 'Slack']

export default function Screen2Work() {
  const { bundle, update } = useWizard()

  const toggleTool = (value: string) => {
    const list = bundle.tools
    const next = list.includes(value) ? list.filter(v => v !== value) : [...list, value]
    update({ tools: next })
  }

  const addProject = () => update({ projects: [...bundle.projects, { name: '', description: '' }] })
  const updateProject = (i: number, patch: Partial<typeof bundle.projects[0]>) =>
    update({ projects: bundle.projects.map((p, idx) => idx === i ? { ...p, ...patch } : p) })
  const removeProject = (i: number) => update({ projects: bundle.projects.filter((_, idx) => idx !== i) })

  return (
    <div className="screen">
      <h2>2. Work</h2>
      <p className="intro">What you actually do. Claude uses this to answer questions without asking every time.</p>

      <div className="row">
        <div className="field">
          <label>Role / title</label>
          <input value={bundle.role} onChange={e => update({ role: e.target.value })} placeholder="Founder" />
        </div>
        <div className="field">
          <label>Company (or "solo")</label>
          <input value={bundle.company} onChange={e => update({ company: e.target.value })} />
        </div>
      </div>

      <div className="field">
        <label>Industry</label>
        <input value={bundle.industry} onChange={e => update({ industry: e.target.value })} />
      </div>

      <div className="field">
        <label>Active projects (up to 5)</label>
        {bundle.projects.map((p, i) => (
          <div className="repeatable" key={i}>
            <div className="row">
              <input value={p.name} onChange={e => updateProject(i, { name: e.target.value })} placeholder="Project name" />
              <input value={p.description} onChange={e => updateProject(i, { description: e.target.value })} placeholder="One-line description" />
            </div>
            <button className="secondary" onClick={() => removeProject(i)}>Remove</button>
          </div>
        ))}
        {bundle.projects.length < 5 && <button className="secondary" onClick={addProject}>+ Add project</button>}
      </div>

      <div className="field">
        <label>Target customer</label>
        <input value={bundle.targetCustomer} onChange={e => update({ targetCustomer: e.target.value })} placeholder="Business owners, founders, operators" />
      </div>

      <div className="field">
        <label>Tools you use</label>
        <div className="chips">
          {TOOL_SUGGESTIONS.map(t => (
            <div key={t} className={`chip ${bundle.tools.includes(t) ? 'on' : ''}`} onClick={() => toggleTool(t)}>{t}</div>
          ))}
        </div>
      </div>

      <NavButtons />
    </div>
  )
}
