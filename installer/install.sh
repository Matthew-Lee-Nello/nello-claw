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

INSTALL_PATH="${NC_INSTALL_PATH:-$HOME/nello-claw}"
TEMPLATE_REF="${NC_TEMPLATE_REF:-main}"
TEMPLATE_REPO="https://github.com/Matthew-Lee-Nello/nello-claw.git"
LOG_FILE="$INSTALL_PATH/install.log"

printf "\n${ACCENT}nello-claw installer${RESET}\n"
printf "${DIM}install path: %s${RESET}\n\n" "$INSTALL_PATH"

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

# 10. Drop app-mode shortcut on Mac
if [[ "$(uname)" == "Darwin" ]]; then
  APP_DIR="$HOME/Applications/nello-claw.app"
  mkdir -p "$APP_DIR/Contents/MacOS"

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

# 11. Open the dashboard now
say "opening dashboard"
sleep 2
if [[ "$(uname)" == "Darwin" ]]; then
  if [ -d "$HOME/Applications/nello-claw.app" ]; then
    open "$HOME/Applications/nello-claw.app"
  else
    open "http://localhost:3000"
  fi
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:3000" >/dev/null 2>&1
fi

printf "\n${ACCENT}nello-claw ready.${RESET}\n"
printf "  Dashboard:  http://localhost:3000\n"
printf "  ${DIM}Send a message to your Telegram bot to finish setup.${RESET}\n\n"
