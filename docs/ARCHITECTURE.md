# nello-claw Architecture

## Three deliverables

1. **`web/`** — Next.js app hosted at labs.nello.gg. Runs the 7-screen Brain Method wizard.
2. **`installer/`** — bash one-liner + node bootstrap that users paste into their Terminal.
3. **`template/`** — monorepo of runtime packages cloned onto the user's Mac.

## End-to-end flow

```
┌────────────────────────┐
│ User visits             │
│ labs.nello.gg/wizard    │
└───────────┬─────────────┘
            │ 7 screens of questions
            ▼
┌────────────────────────┐
│ Browser compiles        │  Bundle.json written to ~/Downloads/
│ bundle client-side      │  API keys never leave the browser
└───────────┬─────────────┘
            │ Build My Brain
            ▼
┌────────────────────────┐
│ curl | bash             │  installer/install.sh
│ in Terminal             │
└───────────┬─────────────┘
            │ clone template + pnpm install + pnpm build
            ▼
┌────────────────────────┐
│ template/bootstrap.js   │  Renders every .hbs with bundle values.
│                         │  Writes CLAUDE.md, .env, .mcp.json.
│                         │  Seeds vault from chosen preset.
│                         │  Symlinks 11 skills into ~/.claude/skills/.
│                         │  Merges ~/.claude/settings.json.
│                         │  Installs LaunchAgent + morning brief.
└───────────┬─────────────┘
            ▼
┌────────────────────────┐
│ Three surfaces running  │
│ simultaneously:         │
│  - Telegram bot daemon  │
│  - Dashboard (:3000)    │
│  - Terminal claude CLI  │
│ All share SQLite at     │
│ store/clawd.db          │
└────────────────────────┘
```

## Template monorepo

```
template/
├── CLAUDE.md.hbs                  Personalised system prompt
├── AGENTS.md.hbs                  Session startup protocol
├── .env.example                   Every env var documented
├── .mcp.json.hbs                  MCP config
├── claude_desktop_config.json.hbs Desktop app MCP config
├── com.nello-claw.server.plist.hbs  macOS LaunchAgent
├── brain-context.md.hbs           Auto-injected identity summary
├── bootstrap.js                   Install orchestrator
├── pnpm-workspace.yaml
├── src/index.ts                   Daemon entry (wires bot + scheduler + dashboard)
├── packages/
│   ├── core/                      SQLite schema + memory + agent wrapper
│   ├── vault-seeder/              Renders vault preset into disk
│   ├── bot-telegram/              grammy bot with format/split helpers
│   ├── voice-online/              Groq STT + ElevenLabs TTS
│   ├── voice-local/               mlx-whisper + Piper
│   ├── scheduler/                 Cron poller + schedule CLI + morning brief seeder
│   ├── dashboard/                 Express + WebSocket + React UI (Chat/Cron/Monitoring)
│   └── audit/                     nello-claw audit + doctor
├── hooks/
│   ├── inject-brain-context.sh    SessionStart
│   ├── auto-memory.js             UserPromptSubmit memory capture
│   ├── graphify-incremental.sh    PostToolUse graph rebuild
│   ├── statusline.sh              Terminal statusline
│   └── settings.json.hbs          ~/.claude/settings.json merge source
├── skills/                        7 bundled Tier 1 skills
└── vault-presets/                 nello / para / zettelkasten / custom
```

## Memory model

Three layers, each with a different retention profile:

1. **Claude Code session resumption** (per-chat sessionId) - ephemeral, per conversation
2. **SQLite `memories` table** - dual sector: semantic (1.0 start salience, decays 0.98/day, deletes <0.1) + episodic (decays faster)
3. **Auto-memory files** at `~/.claude/projects/<proj>/memory/*.md` - MEMORY.md index, user/feedback/project/reference types

All three get injected into the session by the SessionStart hook.

## Skill pack (Tier 1, always installed)

11 skills symlinked into `~/.claude/skills/` by the installer:

| Skill | What it does |
|-------|--------------|
| karpathy-guidelines | Clean, minimal code reasoning |
| find-skills | Discover + install skills |
| find-mcp | Discover + install MCPs |
| research | Parallel multi-source research |
| checkpoint | Save summary before /newchat |
| think | Structured problem breakdown |
| self-improving | Agent reflects on mistakes |
| simplify | Review code for reuse/quality |
| vault-audit | Check vault against rules |
| update-config | Edit settings.json safely |
| fewer-permission-prompts | Build allowlist from transcripts |

Tier 2 are opt-in checkboxes on screen 7 (mcp-builder, process-transcript, etc.). Tier 3 is plugin markets (andrej-karpathy-skills, caveman) registered in settings.json.

## Vault presets

- **NELLO** - dense prefix taxonomy with wikilinks. Matt's system.
- **PARA** - Projects / Areas / Resources / Archive. Tiago Forte.
- **Zettelkasten** - atomic notes with unique ID prefixes.
- **Custom** - user defines their own prefixes in the wizard.

Each preset has a `VAULT-RULES.md` (or `Resource-Vault-Rules.md` for NELLO), an `Inbox.md`, any starter MOCs, and a `_stubs/` directory for dynamic note creation later.

## Security

- API keys compiled in the browser via client-side Handlebars. The edge API only hands out install tokens.
- Installer reads bundle from `~/Downloads/` on user's machine. Never fetched from server.
- Keys live in `~/nello-claw/.env` with `chmod 600`. 
- LaunchAgent runs as user, no privileged access.

## Extensibility

Users extend via:
- `/find-skills` to add more skills
- `/find-mcp` to wire more MCPs
- `/update-config` to edit settings.json
- `pnpm --filter @nc/<pkg>` workflows for custom code additions
