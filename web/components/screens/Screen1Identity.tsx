'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

export default function Screen1Identity() {
  const { bundle, update } = useWizard()

  return (
    <div className="screen">
      <h2>1. About you</h2>
      <p className="intro">Who is your assistant talking to? This is the basic profile your assistant uses every time.</p>

      <div className="row">
        <div className="field">
          <label>Your name</label>
          <input value={bundle.name} onChange={e => update({ name: e.target.value })} placeholder="e.g. Matt" />
        </div>
        <div className="field">
          <label>What should you call your assistant?</label>
          <input value={bundle.assistantName} onChange={e => update({ assistantName: e.target.value })} placeholder="e.g. Luke, Ada, Max" />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>Your timezone</label>
          <input value={bundle.timezone} onChange={e => update({ timezone: e.target.value })} />
        </div>
        <div className="field">
          <label>Where you are based (optional)</label>
          <input value={bundle.location} onChange={e => update({ location: e.target.value })} placeholder="e.g. Brisbane, Sydney, NYC" />
        </div>
      </div>

      <div className="field">
        <label>Three things you stand for (optional)</label>
        <input
          value={bundle.values.join(', ')}
          onChange={e => update({ values: e.target.value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) })}
          placeholder="e.g. discipline, honesty, doing it for the right reasons"
        />
      </div>

      <div className="row">
        <div className="field">
          <label>How direct should they be?</label>
          <select value={bundle.communicationStyle} onChange={e => update({ communicationStyle: e.target.value as any })}>
            <option value="blunt">Blunt - no fluff, get to the point</option>
            <option value="warm">Warm - friendly, encouraging</option>
            <option value="formal">Formal - professional, polished</option>
            <option value="casual">Casual - relaxed, chatty</option>
          </select>
        </div>
        <div className="field">
          <label>Spelling style</label>
          <select value={bundle.language} onChange={e => update({ language: e.target.value as any })}>
            <option value="AU">Australian (colour, organise)</option>
            <option value="US">American (color, organize)</option>
            <option value="UK">British (colour, organise)</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <NavButtons disableNext={!bundle.name || !bundle.assistantName} />
    </div>
  )
}
