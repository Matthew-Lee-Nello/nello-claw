# nello-claw

Hosted live-compile Brain Method setup for Skool members. One public website compiles a personalised Claude Code stack (Telegram bot + web dashboard + Obsidian vault + MCPs + skill pack + LaunchAgent) that a user installs on their Mac with a single terminal command.

Product lives at `labs.nello.gg`.

## Repo Layout

- `web/` - Next.js 15 app. Hosted at labs.nello.gg. The 7-screen Brain Method wizard.
- `installer/` - Bash + Node bootstrap that runs on the user's Mac.
- `template/` - Monorepo of runtime packages + skills + hooks + vault presets. Cloned into the user's `~/nello-claw/` on install.
- `docs/` - Architecture notes, contributor guide.

## Build

```
pnpm install
pnpm -r build
```

## Licence

MIT.
