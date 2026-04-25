#!/bin/bash
# SessionStart hook - injects user's brain context into every new Claude Code session.
# Expects NC_INSTALL_PATH env var (set by the bootstrap installer).

set -u

INSTALL="${NC_INSTALL_PATH:-$HOME/nello-claw}"
TODAY=$(date +%Y-%m-%d)
YESTERDAY=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d 'yesterday' +%Y-%m-%d)

# 1. Brain context (identity + projects + people summary)
if [ -f "$INSTALL/brain-context.md" ]; then
  echo "## Brain Context"
  cat "$INSTALL/brain-context.md"
  echo ""
fi

# 2. Knowledge graph summary if graphify is installed
if [ -f "$INSTALL/graphify-out/GRAPH_REPORT.md" ]; then
  echo "## Knowledge Graph (auto-loaded)"
  head -100 "$INSTALL/graphify-out/GRAPH_REPORT.md"
  echo ""
fi

# 3. Today's + yesterday's daily journal
for DAY in "$TODAY" "$YESTERDAY"; do
  if [ -f "$INSTALL/memory/$DAY.md" ]; then
    echo "## Journal - $DAY"
    cat "$INSTALL/memory/$DAY.md"
    echo ""
  fi
done

# 4. Inbox if vault is wired
VAULT_PATH=$(grep -E '^VAULT_PATH=' "$INSTALL/.env" 2>/dev/null | cut -d= -f2 | tr -d '"')
if [ -n "$VAULT_PATH" ] && [ -f "$VAULT_PATH/Inbox.md" ]; then
  echo "## Inbox"
  cat "$VAULT_PATH/Inbox.md"
  echo ""
fi
