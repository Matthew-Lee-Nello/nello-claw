---
tags: [vault, rules, taxonomy, zettelkasten]
date: {{today}}
---

# Vault Rules - Zettelkasten

This vault follows the Zettelkasten method. Atomic notes. Unique IDs. Dense linking.

## Core Principles

1. **One idea per note.** If a note has two ideas, split it.
2. **Unique ID prefix** on every note filename: `YYYYMMDDHHMM-slug.md`
3. **Dense linking.** Every note ends with a Related Notes section linking to at least 2 other notes.
4. **Write in your own words.** Never paste quotes without context and paraphrase.

## Note Types

- **Fleeting** - raw capture, lives in Inbox for under a week
- **Literature** - notes on what others wrote (books, articles)
- **Permanent** - atomic, own-words ideas with IDs, linked into the graph

## ID Format

`YYYYMMDDHHMM-short-slug.md`

Example: `202604231200-burstiness-beats-uniformity.md`

## Frontmatter

```yaml
---
id: 202604231200
type: fleeting|literature|permanent
tags: [at least one]
date: YYYY-MM-DD
---
```

## Note Body Template

```
# [Title - one sentence claim]

[Body - one idea, in your own words]

## Sources

- [[literature-note-id]] - author, page

## Related

- [[other-note-id-1]]
- [[other-note-id-2]]
```

## Inbox

`Inbox.md` holds fleeting notes. Process weekly: promote to Literature or Permanent, or delete.

## Style

- Active voice
- Be specific
- Short titles that state the claim
- No em dashes
- {{language}} English
