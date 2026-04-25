'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

export default function Screen3People() {
  const { bundle, update } = useWizard()

  function repeatable(
    list: any[],
    field: 'teamMembers' | 'clients' | 'mentors',
    keys: Array<{ name: string; placeholder: string }>
  ) {
    return (
      <>
        {list.map((item, i) => (
          <div className="repeatable" key={i}>
            <div className="row">
              {keys.map(k => (
                <input
                  key={k.name}
                  value={(item[k.name] as string | undefined) ?? ''}
                  placeholder={k.placeholder}
                  onChange={e => update({ [field]: list.map((x, idx) => idx === i ? { ...x, [k.name]: e.target.value } : x) } as any)}
                />
              ))}
            </div>
            <button className="secondary" onClick={() => update({ [field]: list.filter((_, idx) => idx !== i) } as any)}>Remove</button>
          </div>
        ))}
        <button className="secondary" onClick={() => {
          const blank = Object.fromEntries(keys.map(k => [k.name, '']))
          update({ [field]: [...list, blank] } as any)
        }}>+ Add</button>
      </>
    )
  }

  return (
    <div className="screen">
      <h2>3. People in your world</h2>
      <p className="intro">Tell your assistant about the people you work with. They will remember names, roles, and the context that matters - so you do not have to.</p>

      <div className="field">
        <label>Team</label>
        {repeatable(bundle.teamMembers, 'teamMembers', [
          { name: 'name', placeholder: 'Name' },
          { name: 'role', placeholder: 'What they do' },
        ])}
      </div>

      <div className="field">
        <label>Clients</label>
        {repeatable(bundle.clients, 'clients', [
          { name: 'name', placeholder: 'Name' },
          { name: 'status', placeholder: 'e.g. active, finished, on hold' },
        ])}
      </div>

      <div className="field">
        <label>Mentors and network</label>
        {repeatable(bundle.mentors, 'mentors', [
          { name: 'name', placeholder: 'Name' },
          { name: 'relationship', placeholder: 'How you know them' },
        ])}
      </div>

      <NavButtons />
    </div>
  )
}
