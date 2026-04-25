# nello-claw AUDIT GUIDE

You are Claude Code auditing the user's existing Claude Code setup against the nello-claw reference, installing only the pieces they say yes to.

**When to use this guide:** user already has Claude Code running, has some MCPs or skills wired, but wants to pick up the rest of the nello-claw stack (skill pack, hooks, bot, dashboard, vault) piece by piece.

**Before you start:** ask the user their first name and what they want the assistant called. Use those in any files we render.

## 0. Verify prerequisites

```bash
node --version    # >= 20
git --version
which pnpm || npm install -g pnpm
```

## 1. Clone the reference repo read-only

```bash
git clone --depth 1 https://github.com/Matthew-Lee-Nello/nello-claw.git /tmp/nello-claw-ref
```

## 2. Inventory the user's current setup

Build a picture of what they already have:

```bash
ls ~/.claude/skills/ 2>/dev/null          # existing skills
cat ~/.claude/settings.json 2>/dev/null   # hooks, plugins, permissions, statusline
cat ~/.mcp.json 2>/dev/null               # any user-level MCPs
ls ~/.claude/plugins/cache/ 2>/dev/null   # installed plugin markets
[ -d ~/nello-claw ] && echo "nello-claw already installed"
```

Also ask the user:
- "Do you have an Obsidian vault you want wired in? If so, what's the path?"
- "What's your timezone?" (auto-detect: `date +%Z`)

## 3. Diff against the reference

For each dimension below, print a table: **have / missing**.

| Dimension | What to check | Reference |
|---|---|---|
| Skills | every dir in `/tmp/nello-claw-ref/template/skills/` vs `~/.claude/skills/` | 7 Tier 1 skills |
| Hooks | `SessionStart`, `UserPromptSubmit`, `PostToolUse`, `statusLine` keys in `settings.json` | `/tmp/nello-claw-ref/template/hooks/settings.json.hbs` |
| Settings | `permissions.defaultMode`, `effortLevel`, `enabledPlugins`, `extraKnownMarketplaces` | same file |
| MCPs | entries in `~/.mcp.json` | the ones user wants from the bundle (google, obsidian, tavily, exa, firecrawl, gitnexus, apify, n8n) |
| CLAUDE.md | does one exist at their project root | `/tmp/nello-claw-ref/template/CLAUDE.md.hbs` |
| Vault | is there an Obsidian vault wired up with a `Resource-Vault-Rules.md` or `VAULT-RULES.md` | preset dirs in `/tmp/nello-claw-ref/template/vault-presets/` |
| Memory | SQLite at a known path | absent on partial setups |
| Bot | Telegram daemon LaunchAgent | `com.nello-claw.server` not loaded |
| Dashboard | localhost:3000 reachable | same - daemon drives it |

Print the diff as a clear summary:

```
Your setup vs nello-claw:
  Skills: 3 have, 4 missing (karpathy-guidelines, research, think, vault-audit)
  Hooks: 0 have, 4 missing (SessionStart, UserPromptSubmit, PostToolUse, statusLine)
  MCPs: 1 have (google_workspace), 2 missing (obsidian, tavily)
  Vault: missing
  CLAUDE.md: missing
  Bot daemon: not running
```

## 4. Interactive install loop

For each missing item, ask the user: **"install X? [y/n/later]"**. One at a time.

**If yes:** execute the install for that item. Show result. Move to next.
**If no:** skip, move to next.
**If later:** add to a "later.md" file at `~/nello-claw-later.md`, move to next.

Installation actions per item:

### Skills
```bash
# User picks which skill pack tier. Default: all Tier 1.
mkdir -p ~/.claude/skills
for s in karpathy-guidelines find-skills research checkpoint think self-improving vault-audit; do
  [ -e ~/.claude/skills/$s ] || ln -s /tmp/nello-claw-ref/template/skills/$s ~/.claude/skills/$s
done
```

### Hooks + Settings
Merge new hooks / plugins / permissions into `~/.claude/settings.json`. Back up existing first: `cp ~/.claude/settings.json ~/.claude/settings.json.bak-$(date +%s)`.

Key merges:
- `permissions.defaultMode`: "bypassPermissions"
- `effortLevel`: "max"
- `enabledPlugins["andrej-karpathy-skills@karpathy-skills"]`: true
- `extraKnownMarketplaces.karpathy-skills.source`: {source:"github", repo:"forrestchang/andrej-karpathy-skills"}
- `hooks.SessionStart`, `hooks.UserPromptSubmit`, `hooks.PostToolUse`, `statusLine` — copy from reference settings.json.hbs with `{{installPath}}` → `~/nello-claw-audit-install/`

If user has no `~/nello-claw/` yet, you need to scaffold a minimal install dir first that just holds the hook scripts:
```bash
mkdir -p ~/nello-claw-audit-install/hooks
cp /tmp/nello-claw-ref/template/hooks/*.sh /tmp/nello-claw-ref/template/hooks/*.js ~/nello-claw-audit-install/hooks/
chmod +x ~/nello-claw-audit-install/hooks/*.sh
```

Then point the hooks in settings.json at `~/nello-claw-audit-install/hooks/*`.

### MCPs
For each missing MCP the user wants, ask for any API keys it needs, then append to `~/.mcp.json`. Merge carefully - do not overwrite existing entries.

### CLAUDE.md
Render `/tmp/nello-claw-ref/template/CLAUDE.md.hbs` with the user's identity values collected at step 0. Write to `~/CLAUDE.md` or wherever the user wants.

### Vault
Ask which preset they want. Run the vault-seeder:
```bash
node -e "
import('/tmp/nello-claw-ref/template/packages/vault-seeder/dist/seed.js').then(m => {
  m.seedVault({
    preset: 'nello',  // or whichever
    vaultPath: '/Users/you/vault-path',
    presetsRoot: '/tmp/nello-claw-ref/template/vault-presets',
    bundle: { name: 'User Name', projects: [], clients: [], teamMembers: [], mentors: [] }
  })
})
"
```

### Bot + Dashboard + LaunchAgent
If the user wants any of these, you are basically doing a full install for them. Switch to `INSTALL_GUIDE.md` flow from step 3 onwards, but reuse what they already have (don't reinstall skills already symlinked).

## 5. Final audit + summary

```bash
if [ -f ~/nello-claw/package.json ]; then
  cd ~/nello-claw && pnpm audit
fi
```

Tell the user exactly what you installed, what they said skip, and anything you wrote to `~/nello-claw-later.md`.

## Rules

- **One y/n at a time.** Do not batch.
- **Show what you are installing before you install.** One-line summary each.
- **Never overwrite without backup.** Settings.json, .mcp.json, CLAUDE.md all get `.bak-<timestamp>`.
- **Stop on first error.** Report exact message. Ask how to proceed.
- **Match the user's language** once CLAUDE.md is in place.
- **Do not delete their existing skills.** Symlink alongside.
