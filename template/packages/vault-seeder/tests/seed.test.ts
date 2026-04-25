import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { seedVault } from '../src/seed.js'

const PRESETS_ROOT = join(__dirname, '..', '..', '..', 'vault-presets')

describe('seedVault', () => {
  let vault: string

  beforeEach(() => { vault = mkdtempSync(join(tmpdir(), 'nc-vault-')) })
  afterEach(() => { rmSync(vault, { recursive: true, force: true }) })

  it('seeds nello preset', () => {
    const r = seedVault({
      preset: 'nello',
      vaultPath: vault,
      presetsRoot: PRESETS_ROOT,
      bundle: {
        name: 'Test',
        projects: [{ name: 'Alpha', description: 'first' }],
        clients: [],
        teamMembers: [],
        mentors: [],
        language: 'AU',
      },
    })
    expect(r.written.length).toBeGreaterThan(0)
    expect(existsSync(join(vault, 'Resource-Vault-Rules.md'))).toBe(true)
    expect(existsSync(join(vault, 'Inbox.md'))).toBe(true)
    expect(existsSync(join(vault, 'MOC-Home.md'))).toBe(true)
  })

  it('skips files that already exist without overwrite', () => {
    seedVault({ preset: 'nello', vaultPath: vault, presetsRoot: PRESETS_ROOT, bundle: { projects: [], clients: [], teamMembers: [], mentors: [] } })
    const second = seedVault({ preset: 'nello', vaultPath: vault, presetsRoot: PRESETS_ROOT, bundle: { projects: [], clients: [], teamMembers: [], mentors: [] } })
    expect(second.skipped.length).toBeGreaterThan(0)
    expect(second.written.length).toBe(0)
  })

  it('renders Handlebars values', () => {
    seedVault({
      preset: 'nello',
      vaultPath: vault,
      presetsRoot: PRESETS_ROOT,
      bundle: {
        projects: [{ name: 'Alpha', description: 'first project' }],
        clients: [],
        teamMembers: [],
        mentors: [],
      },
    })
    const moc = readFileSync(join(vault, 'MOC-Projects.md'), 'utf-8')
    expect(moc).toContain('Alpha')
    expect(moc).toContain('first project')
    expect(moc).toContain('[[Project-alpha]]')
  })
})
