---
name: vault-audit
description: Audit the user's Obsidian vault for compliance against the taxonomy rules set during setup. Walks every note and scores it - prefix naming (per chosen preset), frontmatter presence (type/tags/date), wikilink graph health (orphans, broken links), style violations (em dashes, AI cliches, language spellings), and structural requirements (Inbox.md, MOC, today's journal). Writes a structured report to Logs/audit-YYYY-MM-DD-HHMM.md and prints it inline. Read-only by default - does not auto-fix unless user explicitly asks. Use when the user says "audit vault", "vault check", "vault health", "scan vault", "cleanup vault", or asks how the vault is doing against its rules.
trigger: /vault-audit
---

# Vault Audit

Audit the user's Obsidian vault at the path stored in `.env` as `VAULT_PATH` against the rules in its own `VAULT-RULES.md` (or `Resource-Vault-Rules.md` if using the NELLO preset). Read-only by default.

## Before You Start

1. Read the vault rules file (one of):
   - `<VAULT_PATH>/Resource-Vault-Rules.md` (NELLO preset)
   - `<VAULT_PATH>/VAULT-RULES.md` (PARA / Zettelkasten / Custom presets)

   That file is the source of truth. If this skill conflicts with it, the vault rules win.
2. Use `mcp__obsidian__*` tools if installed, otherwise Glob + Read.
3. Skip these paths during the walk: `.obsidian/`, `.archive-*`, `Logs/`, and the vault rules file itself.

## Workflow

1. **Walk the vault.** List root + any subdirectories. Skip excluded paths.
2. **Read every in-scope note** (batch for speed).
3. **Score against the rubric** in [references/audit-rubric.md](references/audit-rubric.md):
   - Inventory by prefix (per the active preset)
   - Frontmatter presence (`type`, `tags`, `date`); `type` should match filename prefix
   - Wikilink graph: inbound/outbound counts, orphans, broken links
   - Style scan: em dashes, banned cliches, language spellings
   - Structure: `Inbox.md` exists, at least one index note (MOC or README) exists, today's journal exists
4. **Write the report** to `<VAULT_PATH>/Logs/audit-YYYY-MM-DD-HHMM.md` (create `Logs/` if missing). Format in the rubric.
5. **Print the same report inline**, ending with concrete next-action recommendations ranked by impact.
6. **Trigger graphify rebuild** if graphify is installed: `bash <install-path>/scripts/graphify-incremental.sh`. Non-fatal if graphify is not installed.

## Hard Rules

- **Respect the language** set in `CLAUDE.md` (AU / US / UK).
- **No em dashes** per voice rules.
- **No AI cliches** per the banned vocab list in `CLAUDE.md`.
- **Read-only** unless the user explicitly says "fix the audit".
- **Never modify the vault rules file** without explicit permission.
- **Never hallucinate `[[wikilinks]]`** in the report - verify every link exists.

## Reference

- [references/audit-rubric.md](references/audit-rubric.md) - full audit checklist, rubric, and output format
