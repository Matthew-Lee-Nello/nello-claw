'use client'

import { useWizard } from '@/lib/store'
import NavButtons from '@/components/NavButtons'

export default function Screen5Voice() {
  const { bundle, update } = useWizard()

  return (
    <div className="screen">
      <h2>5. Voice & Style</h2>
      <p className="intro">How Claude should sound when writing prose for you.</p>

      <div className="field">
        <label>Em-dash policy</label>
        <select value={bundle.emDashPolicy} onChange={e => update({ emDashPolicy: e.target.value as any })}>
          <option value="never">Never</option>
          <option value="sparingly">Sparingly</option>
          <option value="free">Free use</option>
        </select>
      </div>

      <div className="field">
        <label>
          <input type="checkbox" checked={bundle.oxfordComma} onChange={e => update({ oxfordComma: e.target.checked })} />
          {' '}Use Oxford comma by default
        </label>
      </div>

      <div className="field">
        <label>Banned words (comma separated)</label>
        <input
          value={bundle.bannedWords.join(', ')}
          onChange={e => update({ bannedWords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="delve, tapestry, crucial"
        />
      </div>

      <div className="field">
        <label><input type="checkbox" checked={bundle.enableHumanizer} onChange={e => update({ enableHumanizer: e.target.checked })} /> {' '}Load operator-humanizer voice rules</label>
      </div>
      <div className="field">
        <label><input type="checkbox" checked={bundle.enableKarpathyGuidelines} onChange={e => update({ enableKarpathyGuidelines: e.target.checked })} /> {' '}Load Karpathy coding guidelines</label>
      </div>
      <div className="field">
        <label><input type="checkbox" checked={bundle.enableAiHumanizer} onChange={e => update({ enableAiHumanizer: e.target.checked })} /> {' '}Post-process Telegram replies through ai-humanizer</label>
      </div>

      <NavButtons />
    </div>
  )
}
