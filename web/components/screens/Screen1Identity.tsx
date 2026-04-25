'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

export default function Screen1Identity() {
  const { bundle, update } = useWizard()

  return (
    <div className="screen">
      <h2>1. Identity</h2>
      <p className="intro">Who are you. Who is this assistant to you.</p>

      <div className="row">
        <div className="field">
          <label>Your name</label>
          <input value={bundle.name} onChange={e => update({ name: e.target.value })} placeholder="Matt" />
        </div>
        <div className="field">
          <label>Assistant name</label>
          <input value={bundle.assistantName} onChange={e => update({ assistantName: e.target.value })} placeholder="Luke" />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>Timezone</label>
          <input value={bundle.timezone} onChange={e => update({ timezone: e.target.value })} />
        </div>
        <div className="field">
          <label>Location (optional)</label>
          <input value={bundle.location} onChange={e => update({ location: e.target.value })} placeholder="Brisbane, Australia" />
        </div>
      </div>

      <div className="field">
        <label>Values / non-negotiables (up to 3)</label>
        <input
          value={bundle.values.join(', ')}
          onChange={e => update({ values: e.target.value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) })}
          placeholder="Discipline, honesty, faith"
        />
      </div>

      <div className="row">
        <div className="field">
          <label>Communication style</label>
          <select value={bundle.communicationStyle} onChange={e => update({ communicationStyle: e.target.value as any })}>
            <option value="blunt">Blunt</option>
            <option value="warm">Warm</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
          </select>
        </div>
        <div className="field">
          <label>Language</label>
          <select value={bundle.language} onChange={e => update({ language: e.target.value as any })}>
            <option value="AU">Australian English</option>
            <option value="US">US English</option>
            <option value="UK">British English</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <NavButtons disableNext={!bundle.name || !bundle.assistantName} />
    </div>
  )
}
