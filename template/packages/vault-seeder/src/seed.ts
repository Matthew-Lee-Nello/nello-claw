import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { registerHelpers, Handlebars } from './helpers.js'

registerHelpers()

export type VaultPreset = 'nello' | 'para' | 'zettelkasten' | 'custom'

export interface SeedOptions {
  preset: VaultPreset
  vaultPath: string
  presetsRoot: string   // path to the vault-presets/ directory in the template repo
  bundle: Record<string, unknown>  // wizard answers used as Handlebars context
  overwrite?: boolean
}

function slugify(s: string): string {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function enrichBundle(bundle: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...bundle, today: new Date().toISOString().slice(0, 10) }

  for (const key of ['projects', 'teamMembers', 'clients', 'mentors']) {
    const list = bundle[key]
    if (Array.isArray(list)) {
      out[key] = list.map((item: any) => ({
        ...item,
        slug: item.slug ?? (item.name ? slugify(item.name) : undefined),
      }))
    }
  }

  return out
}

function walk(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...walk(full))
    } else {
      results.push(full)
    }
  }
  return results
}

/**
 * Seed the vault at vaultPath using the chosen preset and bundle values.
 * - Copies static files verbatim
 * - Renders .hbs files through Handlebars
 * - Skips _stubs/ directory (rendered on demand by createStubNote)
 * - Skips files that already exist unless overwrite=true
 */
export function seedVault(opts: SeedOptions): { written: string[]; skipped: string[] } {
  const presetDir = join(opts.presetsRoot, opts.preset)
  if (!existsSync(presetDir)) {
    throw new Error(`Preset not found: ${presetDir}`)
  }

  mkdirSync(opts.vaultPath, { recursive: true })

  const ctx = enrichBundle(opts.bundle)
  const written: string[] = []
  const skipped: string[] = []

  for (const src of walk(presetDir)) {
    const rel = relative(presetDir, src)

    // Skip stub directory (used on-demand, not scaffolded)
    if (rel.startsWith('_stubs/')) continue

    const isTemplate = src.endsWith('.hbs')
    const destRel = isTemplate ? rel.replace(/\.hbs$/, '') : rel
    const dest = join(opts.vaultPath, destRel)

    if (existsSync(dest) && !opts.overwrite) {
      skipped.push(destRel)
      continue
    }

    mkdirSync(dirname(dest), { recursive: true })

    if (isTemplate) {
      const raw = readFileSync(src, 'utf-8')
      const out = Handlebars.compile(raw, { noEscape: true })(ctx)
      writeFileSync(dest, out, 'utf-8')
    } else {
      copyFileSync(src, dest)
    }
    written.push(destRel)
  }

  return { written, skipped }
}

/**
 * Render one of the preset's _stubs/*.md.hbs files against a context and write it
 * somewhere in the vault. Used by bot-telegram and dashboard to spawn Project/Person/Client notes.
 */
export function createStubNote(
  stubPath: string,
  outPath: string,
  context: Record<string, unknown>
): void {
  if (!existsSync(stubPath)) throw new Error(`Stub not found: ${stubPath}`)
  const raw = readFileSync(stubPath, 'utf-8')
  const out = Handlebars.compile(raw, { noEscape: true })({ ...context, today: new Date().toISOString().slice(0, 10) })
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, out, 'utf-8')
}
