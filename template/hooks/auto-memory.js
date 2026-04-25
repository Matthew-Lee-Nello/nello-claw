#!/usr/bin/env node
/**
 * UserPromptSubmit hook - scans the user's latest prompt for memory triggers
 * and writes a memory file if matched.
 *
 * Stdin: { prompt: string, session_id?: string, cwd?: string }
 * Writes to: ~/.claude/projects/<escaped-cwd>/memory/<type>_<slug>.md
 * Updates:   ~/.claude/projects/<escaped-cwd>/memory/MEMORY.md (index)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const raw = readFileSync(0, 'utf-8').trim()
if (!raw) process.exit(0)

let payload
try { payload = JSON.parse(raw) } catch { process.exit(0) }

const prompt = (payload.prompt || '').trim()
if (!prompt || prompt.length < 15) process.exit(0)

const cwd = payload.cwd || process.cwd()
const escaped = cwd.replace(/^\//, '-').replace(/\//g, '-')
const memDir = join(homedir(), '.claude', 'projects', escaped, 'memory')

const SIGNALS = {
  user: /\b(my (role|job|name|company|age|timezone|location|email|phone) is|i(?:'|\s)?m (a|an|the) |i work (at|as)|i live in)\b/i,
  feedback: /\b(don'?t|never|stop|always|actually|no,|correction[:,]?|that'?s wrong|prefer(?:red)?|i (like|want) you to)\b/i,
  project: /\b(deadline|launching|ship(?:ping)?|freeze|deploy|release|due by|working on|project [a-z])\b/i,
  reference: /\b(lives at|find(?:s)? (it|them) in|we track [a-z]+ in|the (dashboard|board|channel|folder|doc) for)\b/i,
}

let type = null
for (const [k, re] of Object.entries(SIGNALS)) {
  if (re.test(prompt)) { type = k; break }
}
if (!type) process.exit(0)

mkdirSync(memDir, { recursive: true })

const slug = prompt.toLowerCase()
  .replace(/[^a-z0-9\s]/g, '')
  .split(/\s+/)
  .filter(w => w.length > 3)
  .slice(0, 4)
  .join('_') || 'note'

const ts = new Date().toISOString().slice(0, 10)
const fname = `${type}_${slug}_${ts}.md`
const fpath = join(memDir, fname)

if (existsSync(fpath)) process.exit(0)

const body = `---
name: ${type}: ${slug.replace(/_/g, ' ')}
description: Auto-captured from prompt on ${ts}
type: ${type}
---

${prompt}
`
writeFileSync(fpath, body, 'utf-8')

const indexPath = join(memDir, 'MEMORY.md')
const title = `${type}: ${slug.replace(/_/g, ' ')}`
const line = `- [${title}](${fname}) - captured ${ts}`

if (existsSync(indexPath)) {
  const existing = readFileSync(indexPath, 'utf-8')
  if (!existing.includes(fname)) {
    writeFileSync(indexPath, existing.trimEnd() + '\n' + line + '\n', 'utf-8')
  }
} else {
  writeFileSync(indexPath, `# Memory Index\n\n${line}\n`, 'utf-8')
}

process.exit(0)
