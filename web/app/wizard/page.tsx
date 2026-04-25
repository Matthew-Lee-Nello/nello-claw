'use client'

import { useWizard } from '@/lib/store'
import type { Screen } from '@/lib/types'
import Screen1Identity from '@/components/screens/Screen1Identity'
import Screen2Work from '@/components/screens/Screen2Work'
import Screen3People from '@/components/screens/Screen3People'
import Screen4Vault from '@/components/screens/Screen4Vault'
import Screen5Voice from '@/components/screens/Screen5Voice'
import Screen6Keys from '@/components/screens/Screen6Keys'
import Screen7Finish from '@/components/screens/Screen7Finish'

const LABELS: Record<Screen, string> = {
  1: 'Identity',
  2: 'Work',
  3: 'People',
  4: 'Vault',
  5: 'Voice',
  6: 'Keys + MCPs',
  7: 'Finish',
}

export default function WizardPage() {
  const { screen, setScreen } = useWizard()

  return (
    <div className="wizard">
      <nav className="wizard-nav">
        <ol>
          {([1, 2, 3, 4, 5, 6, 7] as Screen[]).map((n) => (
            <li
              key={n}
              className={`${screen === n ? 'active' : ''} ${screen > n ? 'done' : ''}`}
              onClick={() => setScreen(n)}
            >
              {n}. {LABELS[n]}
            </li>
          ))}
        </ol>
      </nav>
      <main>
        {screen === 1 && <Screen1Identity />}
        {screen === 2 && <Screen2Work />}
        {screen === 3 && <Screen3People />}
        {screen === 4 && <Screen4Vault />}
        {screen === 5 && <Screen5Voice />}
        {screen === 6 && <Screen6Keys />}
        {screen === 7 && <Screen7Finish />}
      </main>
    </div>
  )
}
