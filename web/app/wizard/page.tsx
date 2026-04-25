'use client'

import { useWizard } from '@/lib/store'
import type { Screen } from '@/lib/types'
import Screen1Identity from '@/components/screens/Screen1Identity'
import Screen2Telegram from '@/components/screens/Screen2Telegram'
import Screen3Google from '@/components/screens/Screen3Google'
import Screen4Build from '@/components/screens/Screen4Build'

const LABELS: Record<Screen, string> = {
  1: 'About you',
  2: 'Phone',
  3: 'Google',
  4: 'Build',
}

export default function WizardPage() {
  const { screen, setScreen } = useWizard()

  return (
    <div className="wizard">
      <nav className="wizard-nav">
        <ol>
          {([1, 2, 3, 4] as Screen[]).map((n) => (
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
        {screen === 2 && <Screen2Telegram />}
        {screen === 3 && <Screen3Google />}
        {screen === 4 && <Screen4Build />}
      </main>
    </div>
  )
}
