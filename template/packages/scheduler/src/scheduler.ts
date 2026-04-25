import cronParser from 'cron-parser'
const { parseExpression } = cronParser
import {
  getDueTasks, updateTaskAfterRun,
  runAgent,
  SCHEDULER_POLL_MS,
  logger,
} from '@nc/core'

export type Sender = (chatId: string, text: string) => Promise<void>

export function computeNextRun(cronExpression: string, from: Date = new Date()): number {
  return Math.floor(parseExpression(cronExpression, { currentDate: from }).next().getTime() / 1000)
}

let timer: NodeJS.Timeout | null = null

export function initScheduler(send: Sender): void {
  if (timer) return

  const tick = async () => {
    const due = getDueTasks()
    for (const task of due) {
      try {
        logger.info({ id: task.id, prompt: task.prompt.slice(0, 80) }, 'Running task')

        // Bump next_run immediately to prevent re-firing if this run is slow
        const nextRun = computeNextRun(task.schedule)
        updateTaskAfterRun(task.id, nextRun, 'running')

        const result = await runAgent(task.prompt)
        const resultText = result.text || '(no output)'

        await send(task.chat_id, resultText)
        updateTaskAfterRun(task.id, nextRun, resultText.slice(0, 500))
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        logger.error({ id: task.id, err }, 'Task failed')
        updateTaskAfterRun(task.id, computeNextRun(task.schedule), `error: ${msg}`)
      }
    }
  }

  // Fire once immediately, then on interval
  tick()
  timer = setInterval(tick, SCHEDULER_POLL_MS)
  logger.info('Scheduler started')
}

export function stopScheduler(): void {
  if (timer) { clearInterval(timer); timer = null }
}
