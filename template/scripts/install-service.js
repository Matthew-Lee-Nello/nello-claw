#!/usr/bin/env node
/**
 * Cross-platform service installer.
 * Mac:   launchctl + plist
 * Win:   Task Scheduler + schtasks
 * Linux: systemd user service
 *
 * Reads NC_INSTALL_PATH + NC_LAUNCHAGENT_LABEL from env.
 * Idempotent - safe to rerun.
 */

import { execSync, spawnSync } from 'node:child_process'
import { writeFileSync, readFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir, platform } from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = join(__dirname, '..')
const INSTALL = process.env.NC_INSTALL_PATH || join(homedir(), 'nello-claw')
const LABEL = process.env.NC_LAUNCHAGENT_LABEL || 'com.nello-claw.server'
const NODE = process.execPath
// Daemon entry compiled to template/dist/index.js (the @nc/template package
// builds into its own dist/, not the install root). Don't change without also
// fixing template/package.json's build output path.
const ENTRY = join(INSTALL, 'template', 'dist', 'index.js')

const ACCENT = '\x1b[38;2;255;166;0m'
const RED = '\x1b[38;2;255;80;80m'
const RESET = '\x1b[0m'
const ok = (m) => console.log(`  ${ACCENT}✓${RESET} ${m}`)
const fail = (m) => console.log(`  ${RED}✗${RESET} ${m}`)

function installMac() {
  const dest = join(homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`)
  mkdirSync(dirname(dest), { recursive: true })

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${NODE}</string>
        <string>${ENTRY}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${INSTALL}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${INSTALL}/store/server.log</string>
    <key>StandardErrorPath</key>
    <string>${INSTALL}/store/server.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:${homedir()}/.local/bin:/usr/bin:/bin</string>
        <key>HOME</key>
        <string>${homedir()}</string>
        <key>NC_INSTALL_PATH</key>
        <string>${INSTALL}</string>
    </dict>
    <key>ThrottleInterval</key>
    <integer>5</integer>
</dict>
</plist>
`
  writeFileSync(dest, plist)
  const uid = process.getuid?.() ?? 501
  try { execSync(`launchctl bootout gui/${uid}/${LABEL}`, { stdio: 'ignore' }) } catch {}
  try {
    execSync(`launchctl bootstrap gui/${uid} "${dest}"`, { stdio: 'ignore' })
    ok(`LaunchAgent loaded (${LABEL})`)
  } catch (err) {
    fail(`LaunchAgent load failed: ${err.message}`)
    process.exit(1)
  }
}

function installWindows() {
  // Use schtasks to create on-logon task running as SYSTEM with highest privileges.
  // Task name = LABEL. Action = node entry. Trigger = ONLOGON.
  const cmd = `schtasks /Create /F /TN "${LABEL}" /TR "\\"${NODE}\\" \\"${ENTRY}\\"" /SC ONLOGON /RL HIGHEST`
  try {
    execSync(cmd, { stdio: 'pipe' })
    ok(`Task Scheduler entry created (${LABEL})`)
    // Start it immediately
    try { execSync(`schtasks /Run /TN "${LABEL}"`, { stdio: 'ignore' }) } catch {}
  } catch (err) {
    fail(`Task Scheduler create failed: ${err.message}`)
    process.exit(1)
  }
}

function installLinux() {
  const dest = join(homedir(), '.config', 'systemd', 'user', `${LABEL}.service`)
  mkdirSync(dirname(dest), { recursive: true })

  const unit = `[Unit]
Description=nello-claw assistant daemon
After=network.target

[Service]
Type=simple
ExecStart=${NODE} ${ENTRY}
WorkingDirectory=${INSTALL}
Environment=NC_INSTALL_PATH=${INSTALL}
Restart=always
RestartSec=5
StandardOutput=append:${INSTALL}/store/server.log
StandardError=append:${INSTALL}/store/server.log

[Install]
WantedBy=default.target
`
  writeFileSync(dest, unit)
  try {
    execSync('systemctl --user daemon-reload', { stdio: 'ignore' })
    execSync(`systemctl --user enable --now ${LABEL}`, { stdio: 'ignore' })
    ok(`systemd user service enabled (${LABEL})`)
  } catch (err) {
    fail(`systemctl failed: ${err.message}. Run 'loginctl enable-linger $USER' if running headless.`)
    process.exit(1)
  }
}

const p = platform()
if (p === 'darwin') installMac()
else if (p === 'win32') installWindows()
else if (p === 'linux') installLinux()
else { fail(`unsupported platform: ${p}`); process.exit(1) }
