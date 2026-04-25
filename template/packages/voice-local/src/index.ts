import { spawn, execSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { logger } from '@nc/core'

function run(cmd: string, args: string[], stdin?: Buffer | string): Promise<{ stdout: Buffer; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] })
    const outChunks: Buffer[] = []
    const errChunks: string[] = []
    proc.stdout.on('data', (c) => outChunks.push(c))
    proc.stderr.on('data', (c) => errChunks.push(String(c)))
    proc.on('error', reject)
    proc.on('close', (code) => resolve({
      stdout: Buffer.concat(outChunks),
      stderr: errChunks.join(''),
      code: code ?? 0,
    }))
    if (stdin !== undefined) proc.stdin.end(stdin)
  })
}

/**
 * Transcribe audio via mlx-whisper (Apple Silicon) or whisper.cpp fallback.
 * Requires: pip install mlx-whisper  OR  brew install whisper-cpp
 */
export async function transcribeAudio(filePath: string): Promise<string> {
  if (!existsSync(filePath)) throw new Error(`audio file not found: ${filePath}`)

  const model = process.env.NC_WHISPER_MODEL ?? 'mlx-community/whisper-large-v3-turbo'

  try {
    const res = await run('mlx_whisper', [
      filePath,
      '--model', model,
      '--output-format', 'txt',
      '--output-dir', tmpdir(),
    ])
    if (res.code !== 0) throw new Error(res.stderr || 'mlx-whisper failed')

    const outPath = join(tmpdir(), filePath.split('/').pop()!.replace(/\.[^.]+$/, '.txt'))
    const transcript = await readFile(outPath, 'utf-8')
    return transcript.trim()
  } catch (err) {
    logger.warn({ err }, 'mlx-whisper failed, trying whisper.cpp')
    const res = await run('whisper-cpp', ['-m', 'models/ggml-base.en.bin', '-f', filePath, '--output-txt'])
    if (res.code !== 0) throw new Error(`whisper fallback failed: ${res.stderr}`)
    const outPath = `${filePath}.txt`
    return (await readFile(outPath, 'utf-8')).trim()
  }
}

/**
 * Synthesise speech via Piper. Returns WAV Buffer.
 * Requires: brew install piper  AND  a .onnx voice model at $PIPER_VOICE
 */
export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const voice = process.env.PIPER_VOICE ?? join(process.env.HOME ?? '~', '.local', 'share', 'piper', 'en_US-amy-medium.onnx')
  if (!existsSync(voice)) {
    throw new Error(`Piper voice model not found at ${voice}. Set PIPER_VOICE env var.`)
  }

  const res = await run('piper', ['--model', voice, '--output_file', '-'], text)
  if (res.code !== 0) throw new Error(`piper failed: ${res.stderr}`)
  return res.stdout
}

export function voiceCapabilities(): { stt: boolean; tts: boolean } {
  const hasBinary = (cmd: string): boolean => {
    try {
      execSync(`which ${cmd}`, { stdio: 'ignore' })
      return true
    } catch { return false }
  }
  return {
    stt: hasBinary('mlx_whisper') || hasBinary('whisper-cpp'),
    tts: hasBinary('piper'),
  }
}
