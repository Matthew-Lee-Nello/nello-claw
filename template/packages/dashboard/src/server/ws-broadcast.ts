/**
 * WebSocket broadcast registry. Shared between server/index.ts (manages the
 * Set) and route handlers (push events back to clients). Keeping this in a
 * separate module avoids a circular dep between routes and server/index.
 */

import type { WebSocket } from 'ws'
import { WebSocket as WS } from 'ws'

export interface ClientSub {
  ws: WebSocket
  chatId: string | null
  wantLogs: boolean
}

export const subs = new Set<ClientSub>()

export function sendToChat(chatId: string, type: string, data: unknown): void {
  if (subs.size === 0) return
  const payload = JSON.stringify({ type, chatId, data })
  for (const s of subs) {
    if (s.chatId === chatId && s.ws.readyState === WS.OPEN) {
      try { s.ws.send(payload) } catch { /* ignore */ }
    }
  }
}

export function broadcastLog(level: string, msg: string, fields: Record<string, unknown>, ts: number): void {
  if (subs.size === 0) return
  const payload = JSON.stringify({ type: 'log', level, msg, fields, ts })
  for (const s of subs) {
    if (s.wantLogs && s.ws.readyState === WS.OPEN) {
      try { s.ws.send(payload) } catch { /* ignore */ }
    }
  }
}
