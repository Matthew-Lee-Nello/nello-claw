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
    // Play notify.wav via Media.SoundPlayer. Reliable on every modern Windows
    // (laptops without motherboard speakers don't get [console]::beep).
    // Fall back to chimes.wav if notify.wav missing.
    const ps = `try { (New-Object Media.SoundPlayer "$env:windir\\Media\\notify.wav").PlaySync() } catch { (New-Object Media.SoundPlayer "$env:windir\\Media\\chimes.wav").PlaySync() }`
    spawn('powershell', ['-NoProfile', '-Command', ps], { detached: true, stdio: 'ignore' }).unref()
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
