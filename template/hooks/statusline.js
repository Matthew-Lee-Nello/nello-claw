#!/usr/bin/env node
/**
 * Statusline (cross-platform Node version, replaces statusline.sh).
 * Reads JSON payload on stdin (model, tokens, cache, cwd) - prints one line.
 */

import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const ACCENT = '\x1b[38;2;255;166;0m'
const DIM = '\x1b[2m'
const RESET = '\x1b[0m'

let payload = '{}'
try { payload = readFileSync(0, 'utf-8') } catch {}
let p = {}
try { p = JSON.parse(payload) } catch {}

const modelRaw = p.model?.id || p.model || ''
let model = '?'
if (/opus/i.test(modelRaw)) model = 'opus'
else if (/sonnet/i.test(modelRaw)) model = 'sonnet'
else if (/haiku/i.test(modelRaw)) model = 'haiku'

const tokens = p.session?.input_tokens ?? p.input_tokens
const cache = p.session?.cache_read_input_tokens ?? p.cache_read_input_tokens

const tokenDisplay = typeof tokens === 'number' ? `${(tokens / 1000).toFixed(1)}k` : ''
const cacheDisplay = typeof cache === 'number' && cache > 0 ? ` ${ACCENT}⚡${cache}${RESET}` : ''

let branch = ''
try {
  const cwd = p.cwd || process.cwd()
  branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  if (branch) branch = `${DIM}⎇ ${branch}${RESET}`
} catch {}

const parts = [`${ACCENT}⚡ ${model}${RESET}`]
if (tokenDisplay) parts.push(`${tokenDisplay}${cacheDisplay}`)
if (branch) parts.push(branch)

console.log(parts.join(' │ '))
