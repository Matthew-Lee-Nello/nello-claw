'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

const TOOL_SUGGESTIONS = ['Gmail', 'Google Drive', 'Calendar', 'Slack', 'Notion', 'HubSpot', 'Airtable', 'Figma', 'Zapier', 'Linear']

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
      <h2>2. What you do</h2>
      <p className="intro">Your assistant uses this to answer questions about your work without having to ask every time.</p>

      <div className="row">
        <div className="field">
          <label>Your role</label>
          <input value={bundle.role} onChange={e => update({ role: e.target.value })} placeholder="e.g. Founder, Sales Lead, Operator" />
        </div>
        <div className="field">
          <label>Your business (or "solo")</label>
          <input value={bundle.company} onChange={e => update({ company: e.target.value })} />
        </div>
      </div>

      <div className="field">
        <label>What industry are you in?</label>
        <input value={bundle.industry} onChange={e => update({ industry: e.target.value })} placeholder="e.g. property, e-commerce, agency" />
      </div>

      <div className="field">
        <label>What you are working on right now (up to 5)</label>
        {bundle.projects.map((p, i) => (
          <div className="repeatable" key={i}>
            <div className="row">
              <input value={p.name} onChange={e => updateProject(i, { name: e.target.value })} placeholder="Name of the project" />
              <input value={p.description} onChange={e => updateProject(i, { description: e.target.value })} placeholder="One line about it" />
            </div>
            <button className="secondary" onClick={() => removeProject(i)}>Remove</button>
          </div>
        ))}
        {bundle.projects.length < 5 && <button className="secondary" onClick={addProject}>+ Add</button>}
      </div>

      <div className="field">
        <label>Who you serve</label>
        <input value={bundle.targetCustomer} onChange={e => update({ targetCustomer: e.target.value })} placeholder="e.g. small business owners, founders, real estate agents" />
      </div>

      <div className="field">
        <label>Day-to-day apps you use</label>
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
