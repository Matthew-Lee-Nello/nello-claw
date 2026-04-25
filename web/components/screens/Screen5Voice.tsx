'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

export default function Screen5Voice() {
  const { bundle, update } = useWizard()

  return (
    <div className="screen">
      <h2>5. How they sound</h2>
      <p className="intro">Tune the way your assistant writes. Anything you do not want them to do, just say.</p>

      <div className="field">
        <label>Em dashes - how do you feel about them?</label>
        <select value={bundle.emDashPolicy} onChange={e => update({ emDashPolicy: e.target.value as any })}>
          <option value="never">Never use them</option>
          <option value="sparingly">Use sparingly</option>
          <option value="free">Use them freely</option>
        </select>
        <div className="panel-help">Em dashes are an "AI tell". Most people prefer plain hyphens.</div>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.oxfordComma} onChange={e => update({ oxfordComma: e.target.checked })} />
          {' '}Always use the Oxford comma
        </label>
        <div className="panel-help">Apples, oranges<strong>,</strong> and bananas. Off by default.</div>
      </div>

      <div className="field">
        <label>Words you never want them to use (optional)</label>
        <input
          value={bundle.bannedWords.join(', ')}
          onChange={e => update({ bannedWords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="e.g. delve, leverage, crucial, tapestry"
        />
        <div className="panel-help">Common AI cliches. Add your own pet peeves.</div>
      </div>

      <h3 style={{ marginTop: 32 }}>Built-in writing rules</h3>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.enableHumanizer} onChange={e => update({ enableHumanizer: e.target.checked })} />
          {' '}Sound like a human, not a chatbot (recommended)
        </label>
        <div className="panel-help">Strips out 500+ AI-tell words and phrases. Makes your assistant write like an actual person.</div>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.enableKarpathyGuidelines} onChange={e => update({ enableKarpathyGuidelines: e.target.checked })} />
          {' '}Write clean, simple code (recommended)
        </label>
        <div className="panel-help">Andrej Karpathy's guidelines for keeping code small and surgical. Skip if your assistant never touches code.</div>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.enableAiHumanizer} onChange={e => update({ enableAiHumanizer: e.target.checked })} />
          {' '}Polish messages before they hit your phone
        </label>
        <div className="panel-help">A second pass on Telegram replies to catch any AI-sounding phrases the assistant slipped in.</div>
      </div>

      <NavButtons />
    </div>
  )
}
