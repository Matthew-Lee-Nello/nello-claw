# nello-claw INSTALL GUIDE

You are Claude Code executing a fresh install of nello-claw on the user's machine.

**Input:** the user's `bundle.json` (downloaded from the wizard at labs.nello.gg) is at `~/Downloads/nello-claw-bundle.json`.

**Output:** a complete nello-claw install at `~/nello-claw/` with bot + dashboard + LaunchAgent + skill pack wired and running.

Execute these steps in order. After each step, report the result in one line. If a step fails, stop and ask the user what to do.

## 0. Verify prerequisites

```bash
node --version    # must be >= 20
git --version     # any recent version
which pnpm || npm install -g pnpm
```

If node is missing or < 20, tell the user to install Node 20+ and stop.

## 1. Locate the bundle

```bash
BUNDLE=~/Downloads/nello-claw-bundle.json
[ -f "$BUNDLE" ] || { echo "bundle not found - complete the wizard at labs.nello.gg first"; exit 1; }
```

## 2. Clone the template repo

```bash
if [ -d ~/nello-claw/.git ]; then
  git -C ~/nello-claw pull --quiet
else
  git clone --depth 1 https://github.com/Matthew-Lee-Nello/nello-claw.git ~/nello-claw
fi
```

## 3. Install dependencies and build

```bash
cd ~/nello-claw
pnpm install --silent
pnpm -r build
```

Report: "built N packages". If build fails, paste the exact error to the user and stop.

## 4. Copy the bundle into place

```bash
cp ~/Downloads/nello-claw-bundle.json ~/nello-claw/bundle.json
```

## 5. Run the bootstrap

```bash
cd ~/nello-claw
NC_INSTALL_PATH=~/nello-claw node template/bootstrap.js
```

This renders all templates, seeds the Obsidian vault preset the user picked, writes `.env` (chmod 600), wires `.mcp.json`, symlinks the skill pack into `~/.claude/skills/`, merges `~/.claude/settings.json` with hooks + bypassPermissions + Karpathy plugin, installs the LaunchAgent, seeds the morning brief scheduled task, and runs `nello-claw audit`.

Bundle file gets deleted after success (contains plaintext keys).

## 6. Confirm the daemon is up

```bash
launchctl list | grep nello-claw.server   # should show a PID
curl -s http://localhost:3000/api/monitoring/health
```

If dashboard is not responding, wait 5 seconds and retry (LaunchAgent throttle).

## 7. Wire the Telegram chat ID

The user's `ALLOWED_CHAT_ID` is empty until they message their bot. Tell them:

> "Open Telegram, message your bot, send `/chatid`. It will reply with your chat ID. Paste it here and I'll add it to your `.env`."

After they paste:
```bash
echo "ALLOWED_CHAT_ID=<CHAT_ID>" >> ~/nello-claw/.env
launchctl kickstart -k gui/$(id -u)/com.nello-claw.server
```

## 8. Final report

Give the user:
- path: `~/nello-claw/`
- dashboard: http://localhost:3000
- audit command: `cd ~/nello-claw && pnpm audit`
- restart: `launchctl kickstart -k gui/$(id -u)/com.nello-claw.server`
- logs: `tail -f ~/nello-claw/store/server.log`

Tell them to open the dashboard, send a test message, and try their first Telegram message too.

## Failure modes and recovery

- **pnpm install fails**: likely node version or network. Report exact error.
- **LaunchAgent load fails**: missing `launchctl` permissions. Tell user to re-run step 5 manually.
- **Google OAuth consent needed**: first time the `google_workspace` MCP runs, it opens a browser. User confirms access. Token caches.
- **Existing ~/.claude/settings.json**: bootstrap merges, backs up old to `.bak-<timestamp>`. Tell the user the backup location.
- **Port 3000 already in use**: `lsof -i :3000` to find what's using it. Offer to change `DASHBOARD_PORT` in `.env`.

## Style

- Report each step in one sentence. No narration of what you're about to do.
- If the user asks mid-install, answer and resume.
- Use the user's language per their bundle (`bundle.language` field).
- Match the voice rules in `~/nello-claw/CLAUDE.md` once it exists.
