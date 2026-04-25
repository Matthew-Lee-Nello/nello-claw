# Audit Rubric

The complete checklist used by the `vault-audit` skill when running an audit pass on the vault at `$VAULT_PATH`.

The prefix table below matches the NELLO preset. If the user picked PARA, Zettelkasten, or Custom during setup, substitute the prefixes defined in their `VAULT-RULES.md`.

## Scope

**Walk:** vault root + any content subdirectories
**Skip:** `.obsidian/`, `.archive-*`, `Logs/`, and the vault rules file itself

## 1. Inventory

Count every `.md` file in scope. Bucket by filename prefix:

| Prefix | Type |
|---|---|
| `Log-` | log |
| `Project-` | project |
| `Person-` | person |
| `Client-` | client |
| `Resource-` | resource |
| `Course-` | course |
| `Idea-` | idea |
| `MOC-` | moc |
| (none) | **violation** unless it's `Inbox.md` or a date-stamped file inside `Journal/` |

Report: total count, count per bucket, count with no prefix.

## 2. Frontmatter Compliance

Every in-scope note must have YAML frontmatter with all three fields:

```yaml
---
type: log | project | person | client | resource | course | idea | moc
tags: [tag1, tag2]
date: YYYY-MM-DD
---
```

Flag notes that are:
- Missing frontmatter entirely
- Missing any of `type`, `tags`, `date`
- Have `type` that doesn't match the filename prefix (e.g. `Person-X.md` with `type: idea`)
- Have malformed `date` (not `YYYY-MM-DD`)

Report: count of compliant vs non-compliant, list non-compliant files with the specific field missing.

## 3. Linking Health

Build a wikilink graph:

- **Outbound**: count `[[...]]` references in each note's body. Strip the alias part if present (`[[X|alias]]` → `X`).
- **Inbound**: for each note, count how many other notes link to it.
- **Orphans**: notes with `inbound == 0 AND outbound == 0`.
- **Broken links**: outbound references whose target file does not exist in the vault.
- **MOC presence**: at least one `MOC-` note must exist.

Report:
- Total wikilinks in the vault
- Orphan count and list
- Broken link count and list (with source file and broken target)
- MOC count
- Top 5 most-linked notes (highest inbound)

## 4. Style Violations

Scan note bodies (not frontmatter) for:

- **Em dashes** (`—`) - any occurrence is a violation. Hyphens only.
- **AI clichés**: `leverage`, `delve`, `crucial`, `comprehensive`, `tapestry`, `tackle`, `seamless`, `robust`, `cutting-edge`, `unlock`, `harness`, `navigate the landscape`. Case-insensitive match.
- **US spelling**: `color`, `organize`, `analyze`, `behavior`, `center`, `recognize`, `optimize`, `realize`, `favor`. Case-insensitive. Note: AU is `colour`, `organise`, `analyse`, etc.

Report: file path, line number (if available), violation type, the offending word.

## 5. Structure Checks

- `Inbox.md` exists at vault root
- `Journal/` directory exists
- Today's `Journal/YYYY-MM-DD.md` exists (use the system date)
- At least one `MOC-` note exists

Each missing item is a structure violation.

## 6. Output Format

Write to `Logs/audit-YYYY-MM-DD-HHMM.md` with this structure (use system time for the timestamp):

```markdown
---
type: log
tags: [audit, vault-health]
date: YYYY-MM-DD
---

# Vault Audit - YYYY-MM-DD HH:MM

## Summary
<one sentence: clean / X violations / critical>

## Inventory
- Total notes: N
- By prefix: Log-: N, Project-: N, ...
- No prefix: N

## Folder Violations
<list or "none">

## Frontmatter Compliance
- Compliant: N/N
- Violations: <file: missing field>

## Linking Health
- Total wikilinks: N
- Orphans: N
- Broken: N
- MOCs: N

## Style Violations
<file:line - violation type - "snippet">

## Inbox State
- Exists: yes/no
- #todo items: N

## Top 5 Hubs
1. [[Note]] - N inbound

## Top 5 Orphans
1. [[Note]] - last modified DATE

## Recommendations
<concrete next actions ranked by impact>
```

Print the same report inline to the user.
