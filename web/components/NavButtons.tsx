'use client'

import { useWizard } from '@/lib/store'
import type { Screen } from '@/lib/types'

export default function NavButtons({ disableNext = false, nextLabel }: { disableNext?: boolean; nextLabel?: string }) {
  const { screen, setScreen } = useWizard()

  const back = () => { if (screen > 1) setScreen((screen - 1) as Screen) }
  const next = () => { if (screen < 4) setScreen((screen + 1) as Screen) }

  return (
    <div className="nav-buttons">
      <button className="secondary" onClick={back} disabled={screen === 1}>Back</button>
      {screen < 4 && <button onClick={next} disabled={disableNext}>{nextLabel ?? 'Next'}</button>}
    </div>
  )
}
