#!/bin/bash
# nello-claw installer - Mac + Linux. One paste, one password, done.
#
# Usage:
#   curl -fsSL https://labs.nello.gg/i/mac | bash
#   curl -fsSL https://labs.nello.gg/install.sh | bash
#
# Bundle: looks in ~/Downloads/nello-claw-bundle.json by default.

set -euo pipefail

ACCENT="$(printf '\033[38;2;255;166;0m')"
WHITE="$(printf '\033[38;2;255;255;255m')"
RED="$(printf '\033[38;2;255;80;80m')"
DIM="$(printf '\033[2m')"
RESET="$(printf '\033[0m')"

say() { printf "  ${ACCENT}→${RESET} ${WHITE}%s${RESET}\n" "$1"; }
ok()  { printf "  ${ACCENT}✓${RESET} %s\n" "$1"; }
warn() { printf "  ${ACCENT}!${RESET} %s\n" "$1"; }
fail() { printf "  ${RED}✗${RESET} %s\n" "$1"; exit 1; }

# Install into whatever folder the user is currently in (so they pick the location
# by cd'ing there before running). Override via NC_INSTALL_PATH env var.
INSTALL_PATH="${NC_INSTALL_PATH:-$PWD}"
TEMPLATE_REF="${NC_TEMPLATE_REF:-main}"
TEMPLATE_REPO="https://github.com/Matthew-Lee-Nello/nello-claw.git"
LOG_FILE="$INSTALL_PATH/install.log"

printf "\n${ACCENT}nello-claw installer${RESET}\n"
printf "${DIM}install path: %s${RESET}\n\n" "$INSTALL_PATH"

# Refuse to install into a folder that already has unrelated files
if [ -d "$INSTALL_PATH" ]; then
  if [ ! -d "$INSTALL_PATH/.git" ]; then
    NON_DOT_COUNT=$(ls -A "$INSTALL_PATH" 2>/dev/null | grep -v '^\.' | grep -v '^bundle.json$' | grep -v '^install.log$' | wc -l | tr -d ' ')
    if [ "$NON_DOT_COUNT" -gt 0 ]; then
      fail "Folder $INSTALL_PATH already has files. Make a fresh empty folder + cd there + rerun."
    fi
  fi
fi

mkdir -p "$INSTALL_PATH"
exec > >(tee -a "$LOG_FILE") 2>&1

# 1. Bootstrap Homebrew if missing (Mac)
if [[ "$(uname)" == "Darwin" ]] && ! command -v brew >/dev/null 2>&1; then
  say "installing Homebrew (one-time, prompts for password)"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || fail "Homebrew install failed. Try again: https://brew.sh"
  # Add brew to PATH for this session
  if [[ -d /opt/homebrew/bin ]]; then eval "$(/opt/homebrew/bin/brew shellenv)"; fi
  if [[ -d /usr/local/bin ]]; then eval "$(/usr/local/bin/brew shellenv 2>/dev/null || true)"; fi
fi

# 2. Auto-install Node 20+ if missing or too old
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR=$(node -e "console.log(parseInt(process.versions.node.split('.')[0],10))")
else
  NODE_MAJOR=0
fi

if [ "$NODE_MAJOR" -lt 20 ]; then
  say "installing Node.js"
  if command -v brew >/dev/null 2>&1; then
    brew install node@20 >/dev/null 2>&1
    brew link --overwrite node@20 >/dev/null 2>&1 || true
  elif command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    fail "Node.js 20+ required. Install from https://nodejs.org and retry."
  fi
fi
ok "node $(node --version)"

# 3. Auto-install git if missing
if ! command -v git >/dev/null 2>&1; then
  say "installing git"
  if command -v brew >/dev/null 2>&1; then brew install git >/dev/null 2>&1
  elif command -v apt-get >/dev/null 2>&1; then sudo apt-get install -y git
  else fail "git missing - install manually + retry"
  fi
fi
ok "git $(git --version | awk '{print $3}')"

# 4. Auto-install pnpm + claude CLI
if ! command -v pnpm >/dev/null 2>&1; then
  say "installing pnpm"
  npm install -g pnpm >/dev/null 2>&1
fi
ok "pnpm $(pnpm --version)"

if ! command -v claude >/dev/null 2>&1; then
  say "installing Claude Code CLI"
  npm install -g @anthropic-ai/claude-code >/dev/null 2>&1 || warn "Claude CLI install failed - you can install manually later"
fi
command -v claude >/dev/null 2>&1 && ok "claude $(claude --version 2>/dev/null | head -1)"

# 5. Locate bundle
BUNDLE_PATH="${NC_BUNDLE:-}"
if [ -z "$BUNDLE_PATH" ] && [ -n "${1:-}" ]; then
  BUNDLE_PATH="$1"
fi
if [ -z "$BUNDLE_PATH" ]; then
  for c in "$HOME/Downloads/nello-claw-bundle.json" "$HOME/Downloads/bundle.json"; do
    if [ -f "$c" ]; then BUNDLE_PATH="$c"; break; fi
  done
fi
if [ -z "$BUNDLE_PATH" ] || [ ! -f "$BUNDLE_PATH" ]; then
  fail "bundle.json not found in ~/Downloads/. Complete the wizard at labs.nello.gg first."
fi
ok "bundle: $BUNDLE_PATH"

# 6. Clone or update template
if [ -d "$INSTALL_PATH/.git" ]; then
  say "updating template"
  git -C "$INSTALL_PATH" fetch --quiet origin "$TEMPLATE_REF"
  git -C "$INSTALL_PATH" reset --hard "origin/$TEMPLATE_REF" --quiet
else
  say "cloning template to $INSTALL_PATH"
  if [ -e "$INSTALL_PATH" ] && [ ! -d "$INSTALL_PATH/.git" ]; then
    # Empty target - clone into a temp dir then move
    TMP_CLONE=$(mktemp -d)
    git clone --depth 1 --branch "$TEMPLATE_REF" "$TEMPLATE_REPO" "$TMP_CLONE" --quiet
    rsync -a "$TMP_CLONE/" "$INSTALL_PATH/"
    rm -rf "$TMP_CLONE"
  else
    git clone --depth 1 --branch "$TEMPLATE_REF" "$TEMPLATE_REPO" "$INSTALL_PATH" --quiet
  fi
fi
ok "template ready"

# 7. Copy bundle into place
cp "$BUNDLE_PATH" "$INSTALL_PATH/bundle.json"

# 8. Install deps + build
cd "$INSTALL_PATH"
say "installing dependencies (1-2 min)"
pnpm install --silent
say "building"
pnpm -r --filter '!@nc/web' build >/dev/null
ok "build complete"

# 9. Run bootstrap
NC_INSTALL_PATH="$INSTALL_PATH" node "$INSTALL_PATH/template/bootstrap.js"

# 10. Drop app-mode shortcut on Mac (with icon)
if [[ "$(uname)" == "Darwin" ]]; then
  APP_DIR="$HOME/Applications/nello-claw.app"
  mkdir -p "$APP_DIR/Contents/MacOS" "$APP_DIR/Contents/Resources"

  # Copy icon from cloned repo
  if [ -f "$INSTALL_PATH/installer/icon.icns" ]; then
    cp "$INSTALL_PATH/installer/icon.icns" "$APP_DIR/Contents/Resources/icon.icns"
  fi

  cat > "$APP_DIR/Contents/MacOS/run" <<'LAUNCHER'
#!/bin/bash
URL="http://localhost:3000"
if open -Ra "Google Chrome" 2>/dev/null; then
  open -na "Google Chrome" --args --app="$URL"
elif open -Ra "Microsoft Edge" 2>/dev/null; then
  open -na "Microsoft Edge" --args --app="$URL"
else
  open "$URL"
fi
LAUNCHER
  chmod +x "$APP_DIR/Contents/MacOS/run"

  cat > "$APP_DIR/Contents/Info.plist" <<INFOPLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key><string>run</string>
  <key>CFBundleIconFile</key><string>icon</string>
  <key>CFBundleIdentifier</key><string>com.nello-claw.app</string>
  <key>CFBundleName</key><string>nello-claw</string>
  <key>CFBundleDisplayName</key><string>nello-claw</string>
  <key>CFBundleVersion</key><string>1.0</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>LSUIElement</key><false/>
</dict>
</plist>
INFOPLIST
  ok "app shortcut at $APP_DIR"
fi

# 11. Wait for daemon health, then open the dashboard
# Read DASHBOARD_PORT from .env (default 3000)
DASHBOARD_PORT=$(grep -E '^DASHBOARD_PORT=' "$INSTALL_PATH/.env" 2>/dev/null | cut -d= -f2 | tr -d '"' || true)
DASHBOARD_PORT=${DASHBOARD_PORT:-3000}
DASHBOARD_URL="http://localhost:${DASHBOARD_PORT}"

say "waiting for dashboard to come up"
HEALTHY=0
for i in $(seq 1 30); do
  if curl -fs --max-time 2 "$DASHBOARD_URL/api/monitoring/health" >/dev/null 2>&1; then
    HEALTHY=1
    break
  fi
  sleep 1
done

if [ "$HEALTHY" -eq 1 ]; then
  ok "dashboard is up at $DASHBOARD_URL"
  say "opening it now"
  if [[ "$(uname)" == "Darwin" ]]; then
    touch "$HOME/Applications/nello-claw.app" 2>/dev/null
    if [ -d "$HOME/Applications/nello-claw.app" ]; then
      open "$HOME/Applications/nello-claw.app"
    else
      open "$DASHBOARD_URL"
    fi
    # Open vault in Obsidian alongside the dashboard
    if [ -d "/Applications/Obsidian.app" ] && [ -d "$INSTALL_PATH/vault" ]; then
      open -a Obsidian "$INSTALL_PATH/vault" 2>/dev/null || true
    fi
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$DASHBOARD_URL" >/dev/null 2>&1
    if command -v obsidian >/dev/null 2>&1 && [ -d "$INSTALL_PATH/vault" ]; then
      obsidian "$INSTALL_PATH/vault" >/dev/null 2>&1 &
    fi
  fi
else
  warn "dashboard didn't come up in 30s. Open it manually: $DASHBOARD_URL"
  warn "if that fails, check ${INSTALL_PATH}/store/server.log for errors"
fi

printf "\n${ACCENT}nello-claw ready.${RESET}\n"
printf "  Dashboard:  %s\n" "$DASHBOARD_URL"
printf "  ${DIM}Send a message to your Telegram bot to finish setup.${RESET}\n\n"
printf "If the dashboard didn't open automatically:\n"
printf "  ${DIM}open %s${RESET} (Mac) or paste in browser\n\n" "$DASHBOARD_URL"
