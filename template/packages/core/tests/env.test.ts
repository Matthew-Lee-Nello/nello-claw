import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeFileSync, unlinkSync, existsSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { readEnvFile } from '../src/env.js'

describe('readEnvFile', () => {
  let dir: string
  let envPath: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'nc-env-'))
    envPath = join(dir, '.env')
    process.env.NC_ENV_PATH = envPath
  })

  afterEach(() => {
    if (existsSync(envPath)) unlinkSync(envPath)
    delete process.env.NC_ENV_PATH
  })

  it('parses basic KEY=VALUE lines', () => {
    writeFileSync(envPath, 'FOO=bar\nBAZ=qux\n')
    const r = readEnvFile()
    expect(r.FOO).toBe('bar')
    expect(r.BAZ).toBe('qux')
  })

  it('strips quotes', () => {
    writeFileSync(envPath, 'A="hello world"\nB=\'single\'\n')
    const r = readEnvFile()
    expect(r.A).toBe('hello world')
    expect(r.B).toBe('single')
  })

  it('ignores comments and blank lines', () => {
    writeFileSync(envPath, '# comment\n\nKEY=value\n')
    const r = readEnvFile()
    expect(r.KEY).toBe('value')
    expect(Object.keys(r)).toHaveLength(1)
  })

  it('filters by keys when provided', () => {
    writeFileSync(envPath, 'A=1\nB=2\nC=3\n')
    const r = readEnvFile(['A', 'C'])
    expect(r).toEqual({ A: '1', C: '3' })
  })

  it('returns empty object when file missing', () => {
    process.env.NC_ENV_PATH = '/nonexistent/.env'
    expect(readEnvFile()).toEqual({})
  })

  it('does not pollute process.env', () => {
    writeFileSync(envPath, 'NEVER_SET_THIS_VAR=leak\n')
    readEnvFile()
    expect(process.env.NEVER_SET_THIS_VAR).toBeUndefined()
  })
})
