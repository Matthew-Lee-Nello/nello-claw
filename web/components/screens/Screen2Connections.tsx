'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

export default function Screen2Connections() {
  const { bundle, update } = useWizard()
  const setKey = (k: string, v: string) => update({ keys: { ...bundle.keys, [k]: v } })

  const tg = bundle.keys.TELEGRAM_BOT_TOKEN ?? ''
  const email = bundle.keys.GOOGLE_USER_EMAIL ?? ''
  const cid = bundle.keys.GOOGLE_OAUTH_CLIENT_ID ?? ''
  const secret = bundle.keys.GOOGLE_OAUTH_CLIENT_SECRET ?? ''
  const exa = bundle.keys.EXA_API_KEY ?? ''

  const ready =
    tg.trim().length > 20 &&
    email.includes('@') &&
    cid.length > 10 &&
    secret.length > 10 &&
    exa.length > 10

  return (
    <div className="screen">
      <h2>2. Connect your accounts</h2>
      <p className="intro">
        Five keys, three services. Your assistant texts you (Telegram), runs Gmail / Drive / Calendar (Google), and searches the live web (Exa). Keys stay on your computer - we never see them.
      </p>

      <h3 style={{ marginTop: 24 }}>Telegram</h3>
      <div className="field">
        <label>Bot token</label>
        <input
          type="password"
          value={tg}
          onChange={e => setKey('TELEGRAM_BOT_TOKEN', e.target.value)}
          placeholder="paste from @BotFather"
        />
        <div className="panel-help">
          60-second walkthrough at <a href="/docs/telegram" target="_blank" rel="noopener">/docs/telegram</a>.
        </div>
      </div>

      <h3 style={{ marginTop: 32 }}>Google (Gmail / Drive / Calendar)</h3>
      <div className="field">
        <label>Your Google email</label>
        <input
          type="email"
          value={email}
          onChange={e => setKey('GOOGLE_USER_EMAIL', e.target.value)}
          placeholder="you@gmail.com"
        />
      </div>
      <div className="field">
        <label>Google OAuth Client ID</label>
        <input
          type="password"
          value={cid}
          onChange={e => setKey('GOOGLE_OAUTH_CLIENT_ID', e.target.value)}
          placeholder="paste from Google Cloud Console"
        />
      </div>
      <div className="field">
        <label>Google OAuth Client Secret</label>
        <input
          type="password"
          value={secret}
          onChange={e => setKey('GOOGLE_OAUTH_CLIENT_SECRET', e.target.value)}
          placeholder="paste from Google Cloud Console"
        />
        <div className="panel-help">
          10-minute one-time setup. Step-by-step at <a href="/docs/google" target="_blank" rel="noopener">/docs/google</a>.
        </div>
      </div>

      <h3 style={{ marginTop: 32 }}>Exa (live web research)</h3>
      <div className="field">
        <label>Exa API key</label>
        <input
          type="password"
          value={exa}
          onChange={e => setKey('EXA_API_KEY', e.target.value)}
          placeholder="paste from dashboard.exa.ai"
        />
        <div className="panel-help">
          Free tier. Powers your assistant&apos;s web research. 60-second walkthrough at <a href="/docs/exa" target="_blank" rel="noopener">/docs/exa</a>.
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 16, background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 8, fontSize: 13 }}>
        <strong style={{ color: 'var(--accent)' }}>Want Notion / Linear / GitHub / anything else?</strong>
        {' '}Once your assistant is running, just say <em>&quot;find me a connection for X&quot;</em>. It searches the open ecosystem, walks you through getting any keys, installs it.
      </div>

      <NavButtons disableNext={!ready} />
    </div>
  )
}
