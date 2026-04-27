#!/usr/bin/env node
/**
 * Stop hook - cross-platform end-of-turn beep.
 *
 * Mac:   afplay /System/Library/Sounds/Glass.aiff
 * Win:   [console]::beep via PowerShell, or system sound
 * Linux: paplay or aplay /usr/share/sounds/freedesktop/stereo/complete.oga
 *
 * Detached + silent. Hook can fire and forget; Claude shouldn't wait on it.
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

function play() {
  const p = process.platform
  if (p === 'darwin') {
    spawn('afplay', ['/System/Library/Sounds/Glass.aiff'], { detached: true, stdio: 'ignore' }).unref()
    return
  }
  if (p === 'win32') {
    // [console]::beep(freq, ms). Two short bright beeps so user hears something distinct.
    spawn('powershell', ['-NoProfile', '-Command', '[console]::beep(880,120); [console]::beep(1320,120)'], { detached: true, stdio: 'ignore' }).unref()
    return
  }
  // Linux + others: try paplay → aplay → terminal bell.
  const candidates = [
    ['paplay', ['/usr/share/sounds/freedesktop/stereo/complete.oga']],
    ['aplay', ['-q', '/usr/share/sounds/alsa/Front_Center.wav']],
  ]
  for (const [bin, args] of candidates) {
    if (args[0] && !existsSync(args[args.length - 1])) continue
    try {
      spawn(bin, args, { detached: true, stdio: 'ignore' }).unref()
      return
    } catch {}
  }
  // Fallback: ASCII bell to whatever terminal is attached.
  process.stdout.write('\x07')
}

try { play() } catch {}
process.exit(0)
