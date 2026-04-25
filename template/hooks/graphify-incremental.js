#!/usr/bin/env node
/**
 * PostToolUse hook (cross-platform Node version, replaces graphify-incremental.sh).
 * Rebuilds the knowledge graph incrementally after vault edits. Non-fatal.
 * Skips silently if graphify is not installed.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { execFile } from 'node:child_process'

const INSTALL = process.env.NC_INSTALL_PATH || join(homedir(), 'nello-claw')

// Read stdin payload (JSON from Claude Code hook system)
let payload = ''
try { payload = readFileSync(0, 'utf-8') } catch { process.exit(0) }
let parsed
try { parsed = JSON.parse(payload) } catch { process.exit(0) }

const touched = parsed?.tool_input?.file_path
if (!touched) process.exit(0)

// Bail unless touched file is inside vault
const envPath = join(INSTALL, '.env')
if (!existsSync(envPath)) process.exit(0)
const envText = readFileSync(envPath, 'utf-8')
const match = envText.match(/^VAULT_PATH=(.+)$/m)
const vaultPath = match ? match[1].replace(/^["']|["']$/g, '') : null
if (!vaultPath || !touched.startsWith(vaultPath)) process.exit(0)

// Fire-and-forget incremental rebuild. Detached, output suppressed.
execFile('graphify', ['rebuild', '--incremental'], { cwd: vaultPath, detached: true, stdio: 'ignore' }, () => {})
process.exit(0)
