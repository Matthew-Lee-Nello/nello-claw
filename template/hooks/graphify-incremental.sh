#!/bin/bash
# PostToolUse hook - rebuilds the knowledge graph incrementally after vault edits.
# Non-fatal. Skips silently if graphify is not installed.

set -u

INSTALL="${NC_INSTALL_PATH:-$HOME/nello-claw}"
VAULT_PATH=$(grep -E '^VAULT_PATH=' "$INSTALL/.env" 2>/dev/null | cut -d= -f2 | tr -d '"')

# Bail if vault path not set or graphify not available
[ -z "${VAULT_PATH:-}" ] && exit 0
command -v graphify >/dev/null 2>&1 || exit 0

# Only run if the tool use touched a file inside the vault
TOUCHED_PATH=$(cat | grep -oE '"file_path":\s*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
case "$TOUCHED_PATH" in
  "$VAULT_PATH"/*) ;;
  *) exit 0 ;;
esac

# Fire-and-forget incremental rebuild
(cd "$VAULT_PATH" && graphify rebuild --incremental >/dev/null 2>&1 &)
exit 0
