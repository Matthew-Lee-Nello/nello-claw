---
name: research
description: Parallel multi-source research. Fans out to Exa and Firecrawl (primary web), Tavily (fallback web), Reddit practitioner chatter, the user's local QMD knowledge base collections if installed, and the user's own past context stored in the nello-claw memory database. Synthesises results into a consistent format with citations. Use when the user asks to research a topic, find out what creators say, compare frameworks, or needs both web + knowledge base + personal context in one pass. Also triggers on "research X", "dig into X", "find me everything on X", "cross-reference X", "/research".
trigger: /research
---

# /research - Parallel Multi-Source Research

Fan out to every available research source in parallel. Synthesise citations back. Save the result to local memory so future queries compound.

## Invocation

```
/research <topic or question in natural language>
/research --scope web      # web only (Exa + Firecrawl + Tavily)
/research --scope kb       # local knowledge base only (QMD if installed)
/research --scope memory   # local memories only
```

Default is all legs in parallel.

## Legs (run in parallel)

### Leg 1 - Web primary (Exa + Firecrawl)
Use the `exa` MCP and `firecrawl` MCP if wired in `.mcp.json`. Query each with the same topic. Dedupe by URL domain. Take top 3 from each.

### Leg 2 - Web fallback (Tavily)
Use the `tavily` MCP if wired. Take top 3. If Exa + Firecrawl returned nothing useful, Tavily becomes primary.

### Leg 3 - Reddit
If any web MCP supports Reddit search, use it. Scope to subreddits where practitioners discuss the topic. Look for comments with > 10 upvotes from accounts older than 6 months. Back off on 429 for 10 seconds.

### Leg 4 - Local knowledge base (QMD)
If the user has the `qmd` MCP wired and has ingested any collections (via `/person-kb`, `/book-kb`, `/voice-kb`), query `mcp__qmd__query` with the topic. Default: search all collections. If `--collection <slug>` passed, scope to that one. Retrieve full context for top 2-3 hits via `mcp__qmd__get` or `mcp__qmd__multi_get`.

### Leg 5 - Personal memory
Query the local memory DB at `<install-path>/store/clawd.db`, table `memories`, with FTS5 search on the topic.

```bash
sqlite3 "$CLAWD_DB" \
  "SELECT datetime(created_at,'unixepoch','localtime'), sector, salience, substr(content,1,300) \
   FROM memories WHERE content LIKE '%<keyword>%' AND sector='semantic' \
   ORDER BY salience DESC, created_at DESC LIMIT 10"
```

If the question mentions a specific person, also search `~/.claude/projects/<escaped-project-path>/memory/*.md` for matches.

## Synthesis Format

```markdown
## Research: <question>

### Web findings
(merge Exa + Firecrawl + Tavily + Reddit, dedupe, top 5 cited results. Cite as `[Exa: <url>]`, `[Tavily: <url>]`, `[Reddit: r/<sub> - <title>](<permalink>)`.)

### Framework library
(what local QMD collections say, if any are installed. Cite each claim: `[<Collection>: <source title>]`. Direct quotes preferred.)

### Your past context
(what local memories say. `[memory <date>]` attribution. If nothing, say "nothing found".)

### Synthesis
(3-5 bullets of concrete takeaways, reconciling contradictions. Every bullet cites its source.)

### Recommended next action
(one sentence. What to actually do with this research?)
```

## After the Synthesis

Save the result back to memories as a semantic memory with salience 3.5 so future related queries benefit:

```bash
sqlite3 "$CLAWD_DB" \
  "INSERT INTO memories (chat_id, topic_key, content, sector, salience, created_at, accessed_at) \
   VALUES ('$ALLOWED_CHAT_ID', 'research-<slug>', '<short synthesis>', 'semantic', 3.5, \
   strftime('%s','now'), strftime('%s','now'))"
```

## Rules

1. **Always fan out in parallel.** Never query one source at a time.
2. **Every claim must be cited.** If a bullet does not have a source, drop it.
3. **Never invent quotes.** If QMD returns nothing, say "nothing found" - do not paraphrase from general knowledge.
4. Follow the voice rules in the repo `CLAUDE.md`.
5. **Respect API costs.** Exa, Firecrawl, Tavily all cost credits per call. If the question is trivial, skip the fan-out and just use QMD or a local grep.
6. **Feed the memory loop.** Every completed research synthesis gets saved back to memories.

## Prerequisites

- At least one web MCP wired in `.mcp.json`: exa, firecrawl, or tavily
- `CLAWD_DB` env var points to `<install-path>/store/clawd.db`
- Optional: `qmd` MCP + at least one ingested collection for Leg 4

## Relationship to Other Skills

- **`/find-mcp`** - if any web MCP is missing, use this to install it
- **`/find-skills`** - find additional research-adjacent skills
