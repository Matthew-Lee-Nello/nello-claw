import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function findEnvFile(): string | null {
  // Prefer NC_INSTALL_PATH when set (e.g. sandboxed tests, production daemon)
  const installPath = process.env.NC_INSTALL_PATH
  if (installPath) {
    const candidate = join(installPath, '.env')
    if (existsSync(candidate)) return candidate
  }
  let dir = __dirname
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, '.env')
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

export function readEnvFile(keys?: string[]): Record<string, string> {
  const path = process.env.NC_ENV_PATH || findEnvFile()
  if (!path || !existsSync(path)) return {}

  const contents = readFileSync(path, 'utf-8')
  const out: Record<string, string> = {}

  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const eq = line.indexOf('=')
    if (eq === -1) continue

    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (keys && !keys.includes(key)) continue
    out[key] = value
  }

  return out
}
