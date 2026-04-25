#!/usr/bin/env node
/**
 * SessionStart hook (cross-platform Node version, replaces inject-brain-context.sh).
 * Cats brain-context + graphify summary + today's/yesterday's journal into the new session.
 *
 * Reads NC_INSTALL_PATH from env (set by daemon launcher).
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const INSTALL = process.env.NC_INSTALL_PATH || join(homedir(), 'nello-claw')

function ymd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const today = ymd(new Date())
const yesterday = ymd(new Date(Date.now() - 86400000))

function emitFile(label, path, head = 0) {
  if (!existsSync(path)) return
  console.log(`## ${label}`)
  let body = readFileSync(path, 'utf-8')
  if (head > 0) {
    body = body.split('\n').slice(0, head).join('\n')
  }
  console.log(body)
  console.log('')
}

emitFile('Brain Context', join(INSTALL, 'brain-context.md'))
emitFile('Knowledge Graph (auto-loaded)', join(INSTALL, 'graphify-out', 'GRAPH_REPORT.md'), 100)
emitFile(`Journal - ${today}`, join(INSTALL, 'memory', `${today}.md`))
emitFile(`Journal - ${yesterday}`, join(INSTALL, 'memory', `${yesterday}.md`))

// Inbox if vault wired
const envPath = join(INSTALL, '.env')
if (existsSync(envPath)) {
  const env = readFileSync(envPath, 'utf-8')
  const match = env.match(/^VAULT_PATH=(.+)$/m)
  const vaultPath = match ? match[1].replace(/^["']|["']$/g, '') : null
  if (vaultPath) emitFile('Inbox', join(vaultPath, 'Inbox.md'))
}
