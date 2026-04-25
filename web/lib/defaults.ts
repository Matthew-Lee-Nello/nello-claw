import type { Bundle } from './types'

export const DEFAULT_BUNDLE: Bundle = {
  // User-entered (Screen 1)
  name: '',
  assistantName: '',
  occupation: '',
  bio: '',

  // Silently defaulted - assistant fills these in over time via auto-memory + conversation
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
  location: '',
  values: [],
  communicationStyle: 'blunt',
  language: 'AU',

  role: '',
  company: '',
  industry: '',
  projects: [],
  targetCustomer: '',
  services: [],
  tools: [],

  teamMembers: [],
  clients: [],
  mentors: [],

  vaultPreset: 'nello',
  vaultPath: '',
  graphifyEnabled: true,

  emDashPolicy: 'never',
  oxfordComma: false,
  bannedWords: [],
  enableHumanizer: true,
  enableKarpathyGuidelines: true,
  enableAiHumanizer: true,

  // User-entered (Screen 2 - Connections)
  keys: {},

  // All connections that work without keys + the ones we collect keys for, auto-on.
  // Apify + n8n stay off (need keys we no longer ask for).
  mcps: {
    google: true,
    exa: true,
    obsidian: true,
    gitnexus: true,
    apify: false,
    n8n: false,
  },

  // Surfaces - all on, no user choice
  installTelegram: true,
  installDashboard: true,
  installLaunchAgent: true,
  enableMorningBrief: true,
  morningBriefPrompt: 'Morning brief. 3 lines max per section.\n1. What matters today (Inbox + today\'s journal)\n2. Calendar top 3\n3. Open loops to close',
  morningBriefCron: '0 9 * * *',

  // Voice: local TTS by default. voice-local package handles platform detection;
  // on non-Mac it falls back to off gracefully.
  voiceSource: 'local',

  // Default skill pack (always installed)
  skillPack: [
    'karpathy-guidelines', 'find-skills', 'find-mcp', 'research',
    'checkpoint', 'think', 'self-improving', 'simplify',
    'vault-audit', 'update-config', 'fewer-permission-prompts',
  ],
  // Extra abilities - auto-included so users get them on day 1
  optionalSkills: ['process-transcript', 'process-calls', 'mcp-builder', 'mcp-implement'],

  platform: 'mac',
}
