#!/bin/bash
# Regenerate .mcp.json and claude_desktop_config.json from .env values + current bundle.
# Run this after editing .env to keep the MCP configs in sync.

set -e

INSTALL="${NC_INSTALL_PATH:-$HOME/nello-claw}"
cd "$INSTALL"

if [ ! -f "bundle.json" ]; then
  echo "bundle.json missing - re-run the wizard at labs.nello.gg"
  exit 1
fi

node bootstrap.js
