'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

interface KeyField {
  name: string
  label: string
  required?: boolean
  help: string
  type?: 'text' | 'password'
}

const KEYS: KeyField[] = [
  { name: 'TELEGRAM_BOT_TOKEN', label: 'Telegram bot key (so your assistant can text you)', required: true, help: 'You create a free bot in 60 seconds. Step-by-step at /docs/telegram.', type: 'password' },
  { name: 'GROQ_API_KEY', label: 'Groq key (so your assistant can hear voice notes)', help: 'Free. You only need this if you want to send voice notes. Step-by-step at /docs/groq.', type: 'password' },
  { name: 'GOOGLE_OAUTH_CLIENT_ID', label: 'Google connection ID', help: 'For Gmail, Drive, Docs, Sheets, Calendar. Free. Step-by-step at /docs/google.', type: 'password' },
  { name: 'GOOGLE_OAUTH_CLIENT_SECRET', label: 'Google connection secret', help: 'You get this in the same place as the ID. Step-by-step at /docs/google.', type: 'password' },
  { name: 'GOOGLE_USER_EMAIL', label: 'Your Google email', help: 'The Google account you want your assistant to read and write from.' },
  { name: 'TAVILY_API_KEY', label: 'Tavily key (for live web research)', help: 'Free tier. Step-by-step at /docs/tavily.', type: 'password' },
  { name: 'EXA_API_KEY', label: 'Exa key (for live web research)', help: 'Free tier. Step-by-step at /docs/exa.', type: 'password' },
  { name: 'FIRECRAWL_API_KEY', label: 'Firecrawl key (for reading any website)', help: 'Free tier. Step-by-step at /docs/firecrawl.', type: 'password' },
  { name: 'APIFY_TOKEN', label: 'Apify key (optional, for Instagram and scraping)', help: 'Skip if you do not need it.', type: 'password' },
]

const CONNECTIONS: Array<{ key: keyof import('@/lib/types').Bundle['mcps']; label: string; help: string }> = [
  { key: 'google',    label: 'Google Workspace', help: 'Gmail, Drive, Docs, Sheets, Calendar. Needs the Google connection above.' },
  { key: 'obsidian',  label: 'Notes folder', help: 'Lets your assistant edit your notes directly.' },
  { key: 'tavily',    label: 'Web research (Tavily)', help: 'Needs Tavily key.' },
  { key: 'exa',       label: 'Web research (Exa)', help: 'Needs Exa key.' },
  { key: 'firecrawl', label: 'Read any website (Firecrawl)', help: 'Needs Firecrawl key.' },
  { key: 'gitnexus',  label: 'Code understanding', help: 'For developers. Indexes your local code so your assistant can navigate it. No key needed.' },
  { key: 'apify',     label: 'Instagram + scraping (Apify)', help: 'For pulling content from social media. Needs Apify key.' },
  { key: 'n8n',       label: 'n8n workflows', help: 'If you run n8n. Add your n8n details to .env after install.' },
]

export default function Screen6Keys() {
  const { bundle, update } = useWizard()

  const setKey = (k: string, v: string) => update({ keys: { ...bundle.keys, [k]: v } })
  const toggleConnection = (k: keyof typeof bundle.mcps) => update({ mcps: { ...bundle.mcps, [k]: !bundle.mcps[k] } })

  return (
    <div className="screen">
      <h2>6. Connect your accounts</h2>
      <p className="intro">
        Paste in the keys for the services you want your assistant to use. Skip the ones you do not.
        Keys stay on your computer - they never get sent to us.
      </p>

      {KEYS.map(k => (
        <div className="field" key={k.name}>
          <label>{k.label} {k.required && <span style={{ color: 'var(--accent)' }}>*</span>}</label>
          <input
            type={k.type ?? 'text'}
            value={bundle.keys[k.name] ?? ''}
            onChange={e => setKey(k.name, e.target.value)}
            placeholder={k.required ? 'Required' : 'Skip if you do not need this'}
          />
          <div className="panel-help">{k.help}</div>
        </div>
      ))}

      <h3 style={{ marginTop: 40, marginBottom: 16 }}>What can your assistant access?</h3>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
        Tick anything you want your assistant to be able to do. Each one needs the matching key above.
      </p>
      {CONNECTIONS.map(m => (
        <div className="field" key={m.key}>
          <label>
            <input type="checkbox" checked={!!bundle.mcps[m.key]} onChange={() => toggleConnection(m.key)} />
            {' '}{m.label}
          </label>
          <div className="panel-help">{m.help}</div>
        </div>
      ))}

      <NavButtons />
    </div>
  )
}
