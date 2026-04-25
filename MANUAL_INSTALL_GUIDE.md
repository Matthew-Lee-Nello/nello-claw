# nello-claw MANUAL INSTALL GUIDE

You are Claude Code doing a fresh install for a user who skipped the labs.nello.gg wizard. You collect their answers conversationally, then do what the wizard would have done: compile a bundle locally, call the bootstrap.

## 0. Prerequisites

```bash
node --version    # >= 20
git --version
which pnpm || npm install -g pnpm
```

## 1. Conversational wizard

Ask the following. One at a time. Keep responses tight.

### Identity
- Your name?
- Assistant name? (default: "Claude")
- Timezone? (default: auto-detect)
- Language: AU English / US / UK / other?
- Communication style: blunt / warm / formal / casual?
- Values / non-negotiables (up to 3, comma separated, optional)?

### Work
- Role or title?
- Company or "solo"?
- Industry?
- Main projects (up to 5, name + one-line each, optional)?
- Tools you use (comma separated)?

### People (all optional)
- Team members? (name, role)
- Clients? (name, status)
- Mentors? (name, relationship)

### Vault
- NELLO / PARA / Zettelkasten / Custom preset?
- Existing vault path or new scaffold at `~/nello-claw/vault/`?

### Voice
- Em-dash policy: never / sparingly / free?
- Banned words (optional)?

### Keys
- Telegram bot token (create via @BotFather)?
- Groq API key (voice STT, optional)?
- ElevenLabs key + voice ID (voice TTS, optional)?
- Google OAuth client ID + secret + your Google email (for Gmail/Drive/Docs/Sheets/Calendar, optional)?

### Automation
- Install Telegram bot daemon? (default yes)
- Install web dashboard? (default yes)
- Install LaunchAgent auto-start? (default yes on macOS)
- Morning brief at 09:00 local? (default yes)
- Voice source: online (Groq + ElevenLabs) / local (mlx-whisper + Piper) / off?

## 2. Compile the bundle

Write the answers to `~/nello-claw-bundle.json` using this schema (fields from `web/lib/types.ts`):

```json
{
  "name": "...",
  "assistantName": "...",
  "timezone": "...",
  "language": "...",
  "communicationStyle": "...",
  "values": [...],
  "role": "...",
  "company": "...",
  "projects": [...],
  "teamMembers": [...],
  "clients": [...],
  "mentors": [...],
  "vaultPreset": "...",
  "vaultPath": "...",
  "graphifyEnabled": true,
  "emDashPolicy": "...",
  "oxfordComma": false,
  "bannedWords": [...],
  "enableHumanizer": true,
  "enableKarpathyGuidelines": true,
  "enableAiHumanizer": true,
  "keys": { "TELEGRAM_BOT_TOKEN": "...", ... },
  "mcps": { "google": true, ... },
  "installTelegram": true,
  "installDashboard": true,
  "installLaunchAgent": true,
  "enableMorningBrief": true,
  "morningBriefPrompt": "...",
  "morningBriefCron": "0 9 * * *",
  "voiceSource": "online",
  "skillPack": ["karpathy-guidelines", "find-skills", "find-mcp", "research", "checkpoint", "think", "self-improving", "simplify", "vault-audit", "update-config", "fewer-permission-prompts"],
  "optionalSkills": []
}
```

## 3. Run the install

Follow the same steps as `INSTALL_GUIDE.md` from step 2 onwards, but use `~/nello-claw-bundle.json` instead of `~/Downloads/nello-claw-bundle.json`.

## Rules

- Ask one question at a time.
- Show the user the bundle before writing it. Let them edit.
- Do not skip steps silently.
- Match the `language` value they picked.
- Do not generate a bundle field the user did not answer. Use defaults from `web/lib/defaults.ts`.
