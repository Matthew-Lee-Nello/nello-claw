---
tags: [vault, rules, taxonomy, para]
date: {{today}}
---

# Vault Rules - PARA

This vault follows Tiago Forte's PARA system. Every note lives in exactly one of four folders.

## Folders

| Folder | Purpose |
|--------|---------|
| `Projects/` | Active outcomes with a clear deadline or endpoint. Short-term. |
| `Areas/` | Ongoing responsibilities you maintain. No deadline. Long-term. |
| `Resources/` | Reference material on topics you care about. Neutral, not tied to any one project. |
| `Archive/` | Anything from Projects, Areas, or Resources that is no longer active. |

## Rules

- Move completed Projects to `Archive/` promptly
- An Area is ongoing - no end state. A Project has one.
- Resources are read-only reference. Do not mix with active work.
- When in doubt, favour Archive over deleting

## Frontmatter

Every note needs:

```yaml
---
tags: [at least one]
date: YYYY-MM-DD
status: active|on-hold|complete|archived
---
```

## Linking

- Use `[[wikilinks]]` liberally
- Never hallucinate a link - check the target exists first

## Inbox

`Inbox.md` at the vault root captures raw thoughts. Process weekly into the right PARA folder.

## Style

- Australian English (or whichever language you picked in the wizard)
- No em dashes
- No AI cliches
- Active voice
- Be specific
