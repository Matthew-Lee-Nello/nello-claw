'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Bundle, Screen } from './types'
import { DEFAULT_BUNDLE } from './defaults'

interface WizardState {
  screen: Screen
  bundle: Bundle
  setScreen: (s: Screen) => void
  update: (patch: Partial<Bundle>) => void
  reset: () => void
}

export const useWizard = create<WizardState>()(
  persist(
    (set) => ({
      screen: 1,
      bundle: DEFAULT_BUNDLE,
      setScreen: (s) => set({ screen: s }),
      update: (patch) => set((st) => ({ bundle: { ...st.bundle, ...patch } })),
      reset: () => set({ screen: 1, bundle: DEFAULT_BUNDLE }),
    }),
    { name: 'nello-claw-wizard' }
  )
)
