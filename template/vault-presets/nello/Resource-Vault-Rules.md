---
type: resource
tags: [vault, rules, taxonomy]
date: {{today}}
---

# Vault Rules - NELLO Taxonomy

This vault follows the NELLO prefix taxonomy. Every note starts with one of the prefixes below. No exceptions.

## Prefixes

| Prefix | Purpose |
|--------|---------|
| `Log-` | Daily activity notes. One per day. Filename: `Log-YYYY-MM-DD.md`. |
| `Person-` | People in your world. Filename: `Person-Firstname-Lastname.md`. |
| `Client-` | Current or past clients. Filename: `Client-Name.md`. |
| `Project-` | Active projects. Filename: `Project-Name.md`. |
| `Resource-` | Reference material (rules, docs, how-tos). |
| `Idea-` | Raw ideas and seeds. |
| `MOC-` | Maps of Content. Index notes that link related notes. |
| `Wiki-Concept-` | Extracted teachable concepts (frameworks, models). |
| `Wiki-Pattern-` | Extracted teachable patterns (heuristics). |
| `Wiki-Source-` | Source attribution (person + date + medium). |

## Frontmatter

Every note needs:

```yaml
---
type: log|person|client|project|resource|idea|moc|wiki-concept|wiki-pattern|wiki-source
tags: [at least one]
date: YYYY-MM-DD
---
```

## Linking

- Use `[[wikilinks]]` for every person, project, client, or concept referenced
- Never hallucinate a link - check the target exists first
- Orphan notes are acceptable for raw ideas, but try to link back within a week

## Journal

`memory/YYYY-MM-DD.md` is the daily journal, separate from `Log-YYYY-MM-DD.md`. The journal is auto-appended by the bot. The Log is hand-written.

## Inbox

`Inbox.md` at the vault root captures open loops. Every item should have an action or be moved to a proper note.

## Style

- Australian English (or whichever language you picked in the wizard)
- No em dashes
- No AI cliches
- Active voice
- Be specific
