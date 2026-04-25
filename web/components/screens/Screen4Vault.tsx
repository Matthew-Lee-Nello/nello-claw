'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

const PRESETS = [
  { id: 'nello',        label: 'Standard (recommended)', desc: 'Notes get tagged by what they are: people, clients, projects, ideas, daily logs. Best for business and life mixed together.' },
  { id: 'para',         label: 'PARA', desc: 'Projects / Areas / Resources / Archive. Tiago Forte\'s system. Good if you already use it.' },
  { id: 'zettelkasten', label: 'Zettelkasten', desc: 'One idea per note, dense linking. For deep research and writing.' },
  { id: 'custom',       label: 'Custom', desc: 'Pick your own categories. Tell us what you want to track.' },
] as const

export default function Screen4Vault() {
  const { bundle, update } = useWizard()

  const addPrefix = () => update({ customPrefixes: [...(bundle.customPrefixes ?? []), { prefix: '', description: '' }] })
  const updatePrefix = (i: number, patch: Partial<{ prefix: string; description: string }>) =>
    update({ customPrefixes: (bundle.customPrefixes ?? []).map((p, idx) => idx === i ? { ...p, ...patch } : p) })
  const removePrefix = (i: number) =>
    update({ customPrefixes: (bundle.customPrefixes ?? []).filter((_, idx) => idx !== i) })

  return (
    <div className="screen">
      <h2>4. Your notes</h2>
      <p className="intro">
        Your assistant keeps track of everything in a folder of notes - kind of like a second brain.
        Pick how you want it organised.
      </p>

      <div className="field">
        <label>Pick a system</label>
        <div className="chips">
          {PRESETS.map(p => (
            <div key={p.id} className={`chip ${bundle.vaultPreset === p.id ? 'on' : ''}`} onClick={() => update({ vaultPreset: p.id as any })}>
              {p.label}
            </div>
          ))}
        </div>
        <div className="panel-help">
          {PRESETS.find(p => p.id === bundle.vaultPreset)?.desc}
        </div>
      </div>

      {bundle.vaultPreset === 'custom' && (
        <div className="field">
          <label>Your categories</label>
          {(bundle.customPrefixes ?? []).map((p, i) => (
            <div className="repeatable" key={i}>
              <div className="row">
                <input value={p.prefix} onChange={e => updatePrefix(i, { prefix: e.target.value })} placeholder="Category (e.g. Note, Meeting, Idea)" />
                <input value={p.description} onChange={e => updatePrefix(i, { description: e.target.value })} placeholder="What goes in here" />
              </div>
              <button className="secondary" onClick={() => removePrefix(i)}>Remove</button>
            </div>
          ))}
          <button className="secondary" onClick={addPrefix}>+ Add category</button>
        </div>
      )}

      <div className="field">
        <label>Where should the notes live?</label>
        <input
          value={bundle.vaultPath}
          onChange={e => update({ vaultPath: e.target.value })}
          placeholder="Leave blank and we'll create a folder for you"
        />
        <div className="panel-help">
          Leave blank to start fresh. Or point at an existing Obsidian folder to merge in.
        </div>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.graphifyEnabled} onChange={e => update({ graphifyEnabled: e.target.checked })} />
          {' '}Show me how my notes connect (recommended)
        </label>
        <div className="panel-help">
          Builds a visual map of your notes so your assistant can spot patterns and surface relevant context.
        </div>
      </div>

      <NavButtons />
    </div>
  )
}
