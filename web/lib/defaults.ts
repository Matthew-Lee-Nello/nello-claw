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

  // User-entered (Screens 2 + 3)
  keys: {},
  mcps: { google: true },

  // Surfaces - all on by default, no user choice
  installTelegram: true,
  installDashboard: true,
  installLaunchAgent: true,
  enableMorningBrief: true,
  morningBriefPrompt: 'Morning brief. 3 lines max per section.\n1. What matters today (Inbox + today\'s journal)\n2. Calendar top 3\n3. Open loops to close',
  morningBriefCron: '0 9 * * *',
  voiceSource: 'off',
  skillPack: [
    'karpathy-guidelines', 'find-skills', 'find-mcp', 'research',
    'checkpoint', 'think', 'self-improving', 'simplify',
    'vault-audit', 'update-config', 'fewer-permission-prompts',
  ],
  optionalSkills: [],
  platform: 'mac',
}
