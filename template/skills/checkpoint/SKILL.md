---
name: checkpoint
description: Save a checkpoint of the current Claude Code session before starting a fresh one. Writes a concise 3-5 bullet summary of key decisions, findings, work completed, and any unfinished follow-ups. Use when the user says "checkpoint", "save checkpoint", "checkpoint this session", "save before newchat", or is about to clear context and wants the main threads preserved so the next session can pick up cleanly.
---

# Checkpoint

Save a concise summary of the current session so it can be referenced later, then signal it's safe to start a fresh session.

## Workflow

1. **Write the summary** as a numbered list of 3-5 bullets covering:
   - Key decisions made this session
   - Findings or discoveries worth preserving
   - Work completed (files changed, features shipped)
   - Unfinished tasks or follow-ups needed
2. **Persist it**. In order of preference:
   - If the auto-memory system is active (`~/.claude/projects/<escaped-project-path>/memory/`), save as a project memory file following the format in the parent `CLAUDE.md`.
   - Otherwise append to `<install-path>/memory/YYYY-MM-DD.md` under a `## Checkpoints` section.
3. **Print the summary** inline so the user can skim it.
4. **Confirm** with: "Checkpoint saved. Safe to /newchat."

## Rules

- Keep it short - this is a handoff note, not a transcript.
- Lead with decisions and unfinished work, not process narration.
- Follow the voice rules in the repo `CLAUDE.md`.
- If nothing meaningful happened this session, say so and don't save an empty checkpoint.
