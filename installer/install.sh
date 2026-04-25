#!/bin/bash
# nello-claw installer - entrypoint for the one-liner served by labs.nello.gg.
#
# Usage:
#   curl -fsSL https://labs.nello.gg/i/<token> | bash
#   curl -fsSL https://labs.nello.gg/install.sh | bash -s -- /path/to/bundle.json
#
# Env:
#   NC_INSTALL_PATH  default ~/nello-claw
#   NC_BUNDLE        path to the bundle JSON; if not set, looks in ~/Downloads/
#   NC_TEMPLATE_REF  template git tag/branch (default: main)

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

printf "\n${ACCENT}nello-claw installer${RESET}\n"
printf "${DIM}install path: %s${RESET}\n\n" "$INSTALL_PATH"

# 1. Requirements
command -v node >/dev/null 2>&1 || fail "node missing. Install Node 20+: https://nodejs.org"
NODE_MAJOR=$(node -e "console.log(parseInt(process.versions.node.split('.')[0],10))")
[ "$NODE_MAJOR" -ge 20 ] || fail "node $NODE_MAJOR too old. Need 20+."
ok "node $(node --version)"

command -v git >/dev/null 2>&1 || fail "git missing."
ok "git $(git --version | awk '{print $3}')"

command -v claude >/dev/null 2>&1 || warn "claude CLI not found. Install: npm install -g @anthropic-ai/claude-code"

if ! command -v pnpm >/dev/null 2>&1; then
  say "installing pnpm"
  npm install -g pnpm >/dev/null 2>&1
fi
ok "pnpm $(pnpm --version)"

# 2. Locate bundle
BUNDLE_PATH="${NC_BUNDLE:-}"
if [ -z "$BUNDLE_PATH" ] && [ -n "${1:-}" ]; then
  BUNDLE_PATH="$1"
fi
if [ -z "$BUNDLE_PATH" ]; then
  CANDIDATES=("$HOME/Downloads/nello-claw-bundle.json" "$HOME/Downloads/bundle.json")
  for c in "${CANDIDATES[@]}"; do
    if [ -f "$c" ]; then BUNDLE_PATH="$c"; break; fi
  done
fi
[ -n "$BUNDLE_PATH" ] && [ -f "$BUNDLE_PATH" ] || fail "bundle.json not found. Complete the wizard at labs.nello.gg first."
ok "bundle: $BUNDLE_PATH"

# 3. Clone or update template
if [ -d "$INSTALL_PATH/.git" ]; then
  say "updating template at $INSTALL_PATH"
  git -C "$INSTALL_PATH" fetch --quiet origin "$TEMPLATE_REF"
  git -C "$INSTALL_PATH" reset --hard "origin/$TEMPLATE_REF" --quiet
else
  [ -e "$INSTALL_PATH" ] && fail "$INSTALL_PATH exists but is not a git repo. Move it aside and retry."
  say "cloning template to $INSTALL_PATH"
  git clone --depth 1 --branch "$TEMPLATE_REF" "$TEMPLATE_REPO" "$INSTALL_PATH" --quiet
fi
ok "template ready"

cd "$INSTALL_PATH/template"

# 4. Copy bundle into place
cp "$BUNDLE_PATH" "$INSTALL_PATH/bundle.json"

# 5. Install deps
say "installing dependencies (this takes a minute)"
pnpm install --silent

# 6. Build
say "building packages"
pnpm build >/dev/null
ok "build complete"

# 7. Run bootstrap
cd "$INSTALL_PATH"
NC_INSTALL_PATH="$INSTALL_PATH" NC_BUNDLE="$INSTALL_PATH/bundle.json" node "$INSTALL_PATH/template/bootstrap.js"

printf "\n${ACCENT}nello-claw ready.${RESET}\n"
printf "  cd %s\n" "$INSTALL_PATH"
printf "  claude                          # terminal\n"
printf "  open http://localhost:3000      # dashboard\n\n"
