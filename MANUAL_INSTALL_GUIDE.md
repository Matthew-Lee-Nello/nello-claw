# nello-claw - Manual Install Reference

Reference for installing without using the labs.nello.gg wizard. Not a command file.

If you skip the wizard, you fill out the same answers conversationally inside Claude Code. The end result is the same `~/nello-claw/` folder.

> **Use Claude Code's Plan Mode** (Shift+Tab twice) when you paste the manual install prompt. Your assistant writes out the steps it intends to take. You read them. You approve, or you don't.

## How it differs from the wizard install

The wizard collects your answers in a browser then writes them to a JSON file at `~/Downloads/nello-claw-bundle.json`. The manual flow asks you the same questions in chat instead.

Same install, same security model, same `~/nello-claw/` output. See [INSTALL_GUIDE.md](INSTALL_GUIDE.md) for what gets installed and what does not.

## Questions you will be asked

Identity — your name, what you call your assistant, timezone, language preference.

Work — your role, business, projects you are working on, day-to-day apps.

People — team, clients, mentors (all optional).

Notes — pick a structure (NELLO / PARA / Zettelkasten / Custom) and where to put the folder.

How they sound — em dash policy, banned words, voice rules.

Connections — paste API keys for the services you want (Telegram, Groq for voice, Google Workspace, optional research keys).

Last bits — auto-start on login, daily morning brief, etc.

After answering, your assistant writes a bundle file locally + runs the same `template/bootstrap.js` documented in INSTALL_GUIDE.md.

## Security

Same as INSTALL_GUIDE.md. Read that before approving anything.
