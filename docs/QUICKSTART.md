# Quickstart

## For end users

1. Go to **labs.nello.gg**
2. Watch the 5-minute walkthrough video
3. Complete the 7-screen Brain Method wizard
4. Click **Build My Brain**
5. Paste the one-liner into Terminal
6. Wait ~5 minutes for install
7. Send `/start` to your Telegram bot, or open http://localhost:3000

## For contributors

```bash
git clone https://github.com/Matthew-Lee-Nello/nello-claw.git
cd nello-claw
pnpm install
pnpm -r build
```

Run the wizard locally:

```bash
pnpm dev:web
# opens http://localhost:3939
```

Run a local end-to-end install test:

```bash
# Create a test bundle
cat > /tmp/test-bundle.json <<'EOF'
{
  "name": "Test User",
  "assistantName": "Ada",
  "timezone": "UTC",
  "values": [],
  "communicationStyle": "blunt",
  "language": "US",
  "role": "Dev",
  "company": "Acme",
  "projects": [],
  "teamMembers": [],
  "clients": [],
  "mentors": [],
  "vaultPreset": "para",
  "graphifyEnabled": false,
  "emDashPolicy": "never",
  "oxfordComma": false,
  "bannedWords": [],
  "enableHumanizer": false,
  "enableKarpathyGuidelines": true,
  "enableAiHumanizer": false,
  "keys": { "TELEGRAM_BOT_TOKEN": "dummy", "ALLOWED_CHAT_ID": "0" },
  "mcps": {},
  "installTelegram": false,
  "installDashboard": true,
  "installLaunchAgent": false,
  "enableMorningBrief": false,
  "morningBriefPrompt": "",
  "morningBriefCron": "0 9 * * *",
  "voiceSource": "off",
  "skillPack": ["karpathy-guidelines", "find-skills"],
  "optionalSkills": [],
  "tools": [],
  "frameworks": [],
  "services": [],
  "targetCustomer": "",
  "industry": "",
  "vaultPath": "",
  "location": ""
}
EOF

# Run the installer against the test bundle into a temp dir
NC_INSTALL_PATH=/tmp/nello-claw-test NC_BUNDLE=/tmp/test-bundle.json \
  bash installer/install.sh /tmp/test-bundle.json
```

## Deploying

Web: `cd web && vercel --prod`
Template: tag the repo. Installer pulls by `NC_TEMPLATE_REF` (default `main`).
