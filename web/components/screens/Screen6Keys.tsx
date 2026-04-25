'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

interface KeyField {
  name: string
  label: string
  required?: boolean
  help: string
  getUrl?: string
  type?: 'text' | 'password'
}

const KEYS: KeyField[] = [
  { name: 'TELEGRAM_BOT_TOKEN', label: 'Telegram bot token', required: true, help: 'Open @BotFather in Telegram, type /newbot, follow prompts. Step-by-step at /docs/telegram.', type: 'password' },
  { name: 'GROQ_API_KEY', label: 'Groq API key (voice transcription)', help: 'Free tier at console.groq.com. Step-by-step at /docs/groq.', type: 'password' },
  { name: 'GOOGLE_OAUTH_CLIENT_ID', label: 'Google OAuth client ID', help: 'For Gmail / Drive / Docs / Sheets / Calendar. Step-by-step at /docs/google.', type: 'password' },
  { name: 'GOOGLE_OAUTH_CLIENT_SECRET', label: 'Google OAuth client secret', help: 'Same place as the client ID. Step-by-step at /docs/google.', type: 'password' },
  { name: 'GOOGLE_USER_EMAIL', label: 'Google email to authenticate', help: 'The Google account whose Gmail / Drive / Calendar you want Claude to use.' },
  { name: 'TAVILY_API_KEY', label: 'Tavily API key', help: 'For research skill. Step-by-step at /docs/tavily.', type: 'password' },
  { name: 'EXA_API_KEY', label: 'Exa API key', help: 'For research skill. Step-by-step at /docs/exa.', type: 'password' },
  { name: 'FIRECRAWL_API_KEY', label: 'Firecrawl API key', help: 'For research + scraping skill. Step-by-step at /docs/firecrawl.', type: 'password' },
  { name: 'APIFY_TOKEN', label: 'Apify token (optional)', help: 'For Instagram + scraper actors. Skip if you do not use them.', type: 'password' },
]

const MCP_TOGGLES: Array<{ key: keyof import('@/lib/types').Bundle['mcps']; label: string; help: string }> = [
  { key: 'google',    label: 'Google Workspace MCP', help: 'Gmail, Drive, Docs, Sheets, Calendar. Needs OAuth keys above.' },
  { key: 'obsidian',  label: 'Obsidian MCP',         help: 'Claude can edit your vault files directly.' },
  { key: 'tavily',    label: 'Tavily MCP',           help: 'Research via Tavily. Needs TAVILY_API_KEY.' },
  { key: 'exa',       label: 'Exa MCP',              help: 'Research via Exa. Needs EXA_API_KEY.' },
  { key: 'firecrawl', label: 'Firecrawl MCP',        help: 'Scraping + research. Needs FIRECRAWL_API_KEY.' },
  { key: 'gitnexus',  label: 'gitnexus MCP',         help: 'Local code indexing and navigation. No key.' },
  { key: 'apify',     label: 'Apify MCP',            help: 'Access to the Apify actor marketplace. Needs APIFY_TOKEN.' },
  { key: 'n8n',       label: 'n8n MCP',              help: 'Control your n8n instance. Set N8N_API_URL + N8N_API_KEY in .env after install.' },
]

export default function Screen6Keys() {
  const { bundle, update } = useWizard()

  const setKey = (k: string, v: string) => update({ keys: { ...bundle.keys, [k]: v } })
  const toggleMcp = (k: keyof typeof bundle.mcps) => update({ mcps: { ...bundle.mcps, [k]: !bundle.mcps[k] } })

  return (
    <div className="screen">
      <h2>6. Keys + MCPs</h2>
      <p className="intro">
        You already have Claude Code running, so no Anthropic key is needed.
        Paste API keys for the services you want and pick which MCPs to wire.
        Keys are compiled into your bundle in this browser and never hit our server.
      </p>

      {KEYS.map(k => (
        <div className="field" key={k.name}>
          <label>{k.label} {k.required && <span style={{ color: 'var(--red)' }}>*</span>}</label>
          <input
            type={k.type ?? 'text'}
            value={bundle.keys[k.name] ?? ''}
            onChange={e => setKey(k.name, e.target.value)}
            placeholder={k.required ? 'Required' : 'Optional'}
          />
          <div className="panel-help">{k.help}</div>
        </div>
      ))}

      <h3 style={{ marginTop: 32, marginBottom: 16 }}>MCPs to install</h3>
      {MCP_TOGGLES.map(m => (
        <div className="field" key={m.key}>
          <label>
            <input type="checkbox" checked={!!bundle.mcps[m.key]} onChange={() => toggleMcp(m.key)} />
            {' '}{m.label}
          </label>
          <div className="panel-help">{m.help}</div>
        </div>
      ))}

      <NavButtons />
    </div>
  )
}
