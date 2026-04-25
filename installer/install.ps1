# nello-claw installer - Windows. One paste, one UAC prompt, done.
#
# Usage (in PowerShell):
#   irm https://labs.nello.gg/i/win | iex
#
# Bundle: looks in $HOME\Downloads\nello-claw-bundle.json by default.

$ErrorActionPreference = "Stop"

# Theme
$Accent = "$([char]0x1B)[38;2;255;166;0m"
$White  = "$([char]0x1B)[38;2;255;255;255m"
$Red    = "$([char]0x1B)[38;2;255;80;80m"
$Dim    = "$([char]0x1B)[2m"
$Reset  = "$([char]0x1B)[0m"

function Say($m)  { Write-Host "  ${Accent}=>${Reset} ${White}$m${Reset}" }
function Ok($m)   { Write-Host "  ${Accent}OK${Reset} $m" }
function Warn($m) { Write-Host "  ${Accent}!${Reset} $m" }
function Fail($m) { Write-Host "  ${Red}X${Reset} $m"; exit 1 }

# Install into the folder the user is currently in (override via NC_INSTALL_PATH env var).
$InstallPath = if ($env:NC_INSTALL_PATH) { $env:NC_INSTALL_PATH } else { (Get-Location).Path }
$TemplateRef = if ($env:NC_TEMPLATE_REF) { $env:NC_TEMPLATE_REF } else { "main" }
$TemplateRepo = "https://github.com/Matthew-Lee-Nello/nello-claw.git"
$LogFile = Join-Path $InstallPath "install.log"

Write-Host ""
Write-Host "${Accent}nello-claw installer${Reset}"
Write-Host "${Dim}install path: $InstallPath${Reset}"
Write-Host ""

# Refuse to install into a folder that already has unrelated files
if ((Test-Path $InstallPath) -and -not (Test-Path (Join-Path $InstallPath ".git"))) {
  $existing = Get-ChildItem -Path $InstallPath -Force | Where-Object { $_.Name -notmatch '^\.' -and $_.Name -ne 'bundle.json' -and $_.Name -ne 'install.log' }
  if ($existing.Count -gt 0) {
    Fail "Folder $InstallPath already has files. Make a fresh empty folder, cd into it, then rerun."
  }
}

New-Item -ItemType Directory -Force -Path $InstallPath | Out-Null
Start-Transcript -Path $LogFile -Force | Out-Null

# 1. Check winget (Windows 10 1709+ / 11 ships it)
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Fail "winget missing. Update Windows or install App Installer from Microsoft Store, then retry."
}

# 2. Auto-install Node 20+ if missing or too old
$nodeMajor = 0
if (Get-Command node -ErrorAction SilentlyContinue) {
  $nodeMajor = [int](node -e "console.log(parseInt(process.versions.node.split('.')[0],10))")
}
if ($nodeMajor -lt 20) {
  Say "installing Node.js (UAC prompt)"
  winget install --silent --accept-source-agreements --accept-package-agreements OpenJS.NodeJS.LTS
  $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
}
Ok "node $(node --version)"

# 3. Auto-install git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Say "installing git"
  winget install --silent --accept-source-agreements --accept-package-agreements Git.Git
  $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")
}
Ok "git $((git --version) -split ' ' | Select-Object -Index 2)"

# 4. Auto-install pnpm + claude
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Say "installing pnpm"
  npm install -g pnpm 2>$null | Out-Null
}
Ok "pnpm $(pnpm --version)"

# Obsidian.app install delegated to template/bootstrap.js so all entry paths hit
# the same code (bash one-liner / PowerShell / Claude Code paste-in / manual clone).
$ObsidianExe = "$env:LOCALAPPDATA\Obsidian\Obsidian.exe"

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
  Say "installing Claude Code CLI"
  npm install -g @anthropic-ai/claude-code 2>$null | Out-Null
}
if (Get-Command claude -ErrorAction SilentlyContinue) { Ok "claude installed" }

# 5. Locate bundle
$BundlePath = if ($env:NC_BUNDLE) { $env:NC_BUNDLE } else { "" }
if (-not $BundlePath) {
  $candidates = @(
    (Join-Path $HOME "Downloads\nello-claw-bundle.json"),
    (Join-Path $HOME "Downloads\bundle.json")
  )
  foreach ($c in $candidates) { if (Test-Path $c) { $BundlePath = $c; break } }
}
if (-not $BundlePath -or -not (Test-Path $BundlePath)) {
  Fail "bundle.json not found in Downloads. Complete the wizard at labs.nello.gg first."
}
Ok "bundle: $BundlePath"

# 6. Clone or update
if (Test-Path (Join-Path $InstallPath ".git")) {
  Say "updating template"
  git -C "$InstallPath" fetch --quiet origin $TemplateRef
  git -C "$InstallPath" reset --hard "origin/$TemplateRef" --quiet
} else {
  Say "cloning template"
  if (Test-Path $InstallPath) {
    $tmp = Join-Path ([System.IO.Path]::GetTempPath()) "nello-claw-clone-$([guid]::NewGuid())"
    git clone --depth 1 --branch $TemplateRef $TemplateRepo $tmp --quiet
    Copy-Item -Path "$tmp\*" -Destination $InstallPath -Recurse -Force
    Remove-Item -Recurse -Force $tmp
  } else {
    git clone --depth 1 --branch $TemplateRef $TemplateRepo $InstallPath --quiet
  }
}
Ok "template ready"

# 7. Copy bundle
Copy-Item $BundlePath (Join-Path $InstallPath "bundle.json") -Force

# 8. Install deps + build
Set-Location $InstallPath
Say "installing dependencies (1-2 min)"
pnpm install --silent
Say "building"
pnpm -r --filter '!@nc/web' build | Out-Null
Ok "build complete"

# 9. Run bootstrap
$env:NC_INSTALL_PATH = $InstallPath
node (Join-Path $InstallPath "template\bootstrap.js")

# 10. Drop Start Menu + Desktop shortcut (Chrome --app, falls back to Edge)
$startMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\nello-claw.lnk"
$desktop = Join-Path $HOME "Desktop\nello-claw.lnk"

$chromePath = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) { $chromePath = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe" }
if (-not (Test-Path $chromePath)) { $chromePath = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe" }
if (-not (Test-Path $chromePath)) { $chromePath = $null }

# Use bundled .ico from cloned repo for the shortcut icon
$icoPath = Join-Path $InstallPath "installer\icon.ico"
if (-not (Test-Path $icoPath)) { $icoPath = $null }

foreach ($shortcutPath in @($startMenu, $desktop)) {
  $WshShell = New-Object -ComObject WScript.Shell
  $shortcut = $WshShell.CreateShortcut($shortcutPath)
  if ($chromePath) {
    $shortcut.TargetPath = $chromePath
    $shortcut.Arguments = "--app=http://localhost:3000"
  } else {
    $shortcut.TargetPath = "http://localhost:3000"
  }
  if ($icoPath) {
    $shortcut.IconLocation = "$icoPath,0"
  } elseif ($chromePath) {
    $shortcut.IconLocation = "$chromePath,0"
  }
  $shortcut.Description = "nello-claw - your AI executive assistant"
  $shortcut.Save()
}
Ok "shortcuts created (Start Menu + Desktop)"

# 11. Wait for daemon health, then open the dashboard
$DashboardPort = "3000"
$envFile = Join-Path $InstallPath ".env"
if (Test-Path $envFile) {
  $portLine = Get-Content $envFile | Select-String -Pattern '^DASHBOARD_PORT='
  if ($portLine) { $DashboardPort = (($portLine -split '=', 2)[1]).Trim('"') }
}
$DashboardUrl = "http://localhost:$DashboardPort"

Say "waiting for dashboard to come up"
$Healthy = $false
for ($i = 0; $i -lt 30; $i++) {
  try {
    $resp = Invoke-WebRequest -Uri "$DashboardUrl/api/monitoring/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    if ($resp.StatusCode -eq 200) { $Healthy = $true; break }
  } catch {}
  Start-Sleep -Seconds 1
}

if (-not $Healthy) {
  Warn "dashboard didn't come up in 30s. Open it manually: $DashboardUrl"
  Warn "if that fails, check $InstallPath\store\server.log for errors"
} elseif ($chromePath) {
  Ok "dashboard is up at $DashboardUrl"
  Start-Process -FilePath $chromePath -ArgumentList "--app=$DashboardUrl"
} else {
  Ok "dashboard is up at $DashboardUrl"
  Start-Process $DashboardUrl
}

# Open vault in Obsidian alongside the dashboard
if ((Test-Path $ObsidianExe) -and (Test-Path (Join-Path $InstallPath "vault"))) {
  $vaultUri = "obsidian://open?path=" + [uri]::EscapeDataString((Join-Path $InstallPath "vault"))
  try { Start-Process $vaultUri } catch { Start-Process -FilePath $ObsidianExe }
}

Stop-Transcript | Out-Null

Write-Host ""
Write-Host "${Accent}nello-claw ready.${Reset}"
Write-Host "  Dashboard:  $DashboardUrl"
Write-Host "  ${Dim}Send a message to your Telegram bot to finish setup.${Reset}"
Write-Host ""
Write-Host "If the dashboard didn't open automatically:"
Write-Host "  ${Dim}Start-Process '$DashboardUrl'${Reset} or paste in browser"
Write-Host ""
