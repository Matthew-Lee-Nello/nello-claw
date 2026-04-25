# nello-claw installer

The bash one-liner served from `labs.nello.gg/i/<token>`.

## Flow

1. User completes the wizard at `labs.nello.gg/wizard/`
2. Browser compiles the bundle client-side and downloads `~/Downloads/nello-claw-bundle.json`
3. Site shows: `curl -fsSL https://labs.nello.gg/i/<token> | bash`
4. The token's install script is just a pinned copy of `install.sh` with a specific `NC_TEMPLATE_REF` tag
5. User pastes into Terminal
6. `install.sh` checks deps, clones the template, runs `pnpm install && pnpm build && node bootstrap.js`

## Security

- API keys never leave the user's machine. The token at `/i/<token>` points to this install script, NOT to a bundle. The bundle is downloaded by the browser directly to `~/Downloads/`.
- The installer can also run with an explicit bundle path: `curl ... | bash -s -- /path/to/bundle.json`
