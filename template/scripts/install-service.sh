#!/bin/bash
# Install the nello-claw daemon as a macOS LaunchAgent.
# Called by the installer automatically if the user enabled autostart.

set -e

INSTALL="${NC_INSTALL_PATH:-$HOME/nello-claw}"
LABEL="com.nello-claw.server"
PLIST_SRC="$INSTALL/com.nello-claw.server.plist"
PLIST_DST="$HOME/Library/LaunchAgents/$LABEL.plist"

[ -f "$PLIST_SRC" ] || { echo "plist missing at $PLIST_SRC. Run bootstrap first."; exit 1; }

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
mkdir -p "$HOME/Library/LaunchAgents"
cp "$PLIST_SRC" "$PLIST_DST"
launchctl bootstrap "gui/$(id -u)" "$PLIST_DST"

echo "nello-claw service installed."
echo "  Starts on login"
echo "  Auto-restarts on crash"
echo "  Logs: $INSTALL/store/server.log"
