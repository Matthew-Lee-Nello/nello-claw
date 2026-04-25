'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

export default function Screen2Telegram() {
  const { bundle, update } = useWizard()

  const setKey = (k: string, v: string) => update({ keys: { ...bundle.keys, [k]: v } })
  const token = bundle.keys.TELEGRAM_BOT_TOKEN ?? ''
  const ready = token.trim().length > 20

  return (
    <div className="screen">
      <h2>2. Phone (Telegram)</h2>
      <p className="intro">So your assistant can text you from anywhere. 60 seconds to set up.</p>

      <div className="field">
        <label>Telegram bot token</label>
        <input
          type="password"
          value={token}
          onChange={e => setKey('TELEGRAM_BOT_TOKEN', e.target.value)}
          placeholder="paste the token from @BotFather"
        />
        <div className="panel-help">
          Open Telegram, search <code>@BotFather</code>, send <code>/newbot</code>, follow the prompts. Full walkthrough at{' '}
          <a href="/docs/telegram" target="_blank" rel="noopener">/docs/telegram</a>.
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 16, background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 8, fontSize: 13 }}>
        <strong style={{ color: 'var(--accent)' }}>Why this matters:</strong> the moment your install finishes, send any message to your bot. You get a reply from your assistant on your phone. That&apos;s the wow moment.
      </div>

      <NavButtons disableNext={!ready} />
    </div>
  )
}
