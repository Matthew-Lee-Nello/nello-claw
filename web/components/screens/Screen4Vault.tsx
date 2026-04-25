'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

const PRESETS = [
  { id: 'nello',        label: 'NELLO',        desc: 'Log-/Person-/Client-/Project-/Resource-/Idea-/MOC- prefixes. Dense wikilinks.' },
  { id: 'para',         label: 'PARA',         desc: 'Projects / Areas / Resources / Archive folders. Tiago Forte style.' },
  { id: 'zettelkasten', label: 'Zettelkasten', desc: 'Atomic notes with unique ID prefixes. Dense linking. Permanent vs fleeting.' },
  { id: 'custom',       label: 'Custom',       desc: 'Your own prefixes. Enter them below.' },
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
      <h2>4. Vault Taxonomy</h2>
      <p className="intro">How your notes are organised. Pick a preset or define your own.</p>

      <div className="field">
        <label>Preset</label>
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
          <label>Custom prefixes</label>
          {(bundle.customPrefixes ?? []).map((p, i) => (
            <div className="repeatable" key={i}>
              <div className="row">
                <input value={p.prefix} onChange={e => updatePrefix(i, { prefix: e.target.value })} placeholder="Prefix (e.g. Note)" />
                <input value={p.description} onChange={e => updatePrefix(i, { description: e.target.value })} placeholder="What this prefix is for" />
              </div>
              <button className="secondary" onClick={() => removePrefix(i)}>Remove</button>
            </div>
          ))}
          <button className="secondary" onClick={addPrefix}>+ Add prefix</button>
        </div>
      )}

      <div className="field">
        <label>Vault location</label>
        <input
          value={bundle.vaultPath}
          onChange={e => update({ vaultPath: e.target.value })}
          placeholder="Leave blank to scaffold a fresh vault at ~/nello-claw/vault/"
        />
        <div className="panel-help">
          Leave blank to scaffold a fresh vault at <code>~/nello-claw/vault/</code>.
          Or point at an existing Obsidian vault to merge into.
        </div>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.graphifyEnabled} onChange={e => update({ graphifyEnabled: e.target.checked })} />
          {' '}Enable graphify (builds a knowledge graph of your vault)
        </label>
      </div>

      <NavButtons />
    </div>
  )
}
