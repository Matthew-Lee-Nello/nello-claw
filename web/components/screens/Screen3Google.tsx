'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

export default function Screen3Google() {
  const { bundle, update } = useWizard()

  const setKey = (k: string, v: string) => update({ keys: { ...bundle.keys, [k]: v } })
  const email = bundle.keys.GOOGLE_USER_EMAIL ?? ''
  const cid = bundle.keys.GOOGLE_OAUTH_CLIENT_ID ?? ''
  const secret = bundle.keys.GOOGLE_OAUTH_CLIENT_SECRET ?? ''
  const ready = email.includes('@') && cid.length > 10 && secret.length > 10

  return (
    <div className="screen">
      <h2>3. Google (Gmail / Drive / Calendar)</h2>
      <p className="intro">So your assistant can read your email, manage your calendar, write docs. 10 minutes one-time setup, never again.</p>

      <div className="field">
        <label>Your Google email</label>
        <input
          type="email"
          value={email}
          onChange={e => setKey('GOOGLE_USER_EMAIL', e.target.value)}
          placeholder="you@gmail.com"
        />
        <div className="panel-help">The Google account you want your assistant to read and write from.</div>
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
      </div>

      <div className="panel-help" style={{ marginTop: 12 }}>
        Step-by-step walkthrough at <a href="/docs/google" target="_blank" rel="noopener">/docs/google</a>. Make a Google Cloud project, enable Gmail / Drive / Docs / Sheets / Calendar APIs, create an OAuth client, paste the ID + Secret here. We never see them - they go straight from your browser to your computer.
      </div>

      <NavButtons disableNext={!ready} />
    </div>
  )
}
