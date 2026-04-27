import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
    : undefined,
})

export interface LogEvent {
  level: 'debug' | 'info' | 'warn' | 'error'
  msg: string
  fields: Record<string, unknown>
  ts: number
}

const taps: Array<(e: LogEvent) => void> = []

export function addLogTap(cb: (e: LogEvent) => void): () => void {
  taps.push(cb)
  return () => {
    const i = taps.indexOf(cb)
    if (i >= 0) taps.splice(i, 1)
  }
}

// Monkey-patch the four common levels so every call also fires the taps.
// Keeps pino's own behaviour (file/console output) unchanged.
;(['info', 'warn', 'error', 'debug'] as const).forEach((lvl) => {
  const orig = logger[lvl].bind(logger) as (...args: unknown[]) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(logger as any)[lvl] = (...args: unknown[]) => {
    try { orig(...args) } catch { /* swallow */ }
    if (taps.length === 0) return
    const first = args[0]
    let msg: string
    let fields: Record<string, unknown> = {}
    if (typeof first === 'string') {
      msg = first
    } else if (typeof first === 'object' && first !== null) {
      fields = first as Record<string, unknown>
      msg = typeof args[1] === 'string' ? (args[1] as string) : ''
    } else {
      msg = String(first ?? '')
    }
    const evt: LogEvent = { level: lvl, msg, fields, ts: Date.now() }
    taps.forEach((t) => {
      try { t(evt) } catch { /* tap failure must not break logging */ }
    })
  }
})
