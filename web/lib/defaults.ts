import type { Bundle } from './types'

export const DEFAULT_BUNDLE: Bundle = {
  name: '',
  assistantName: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
  location: '',
  values: [],
  communicationStyle: 'blunt',
  language: 'US',

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

  keys: {},
  mcps: { google: true },

  installTelegram: true,
  installDashboard: true,
  installLaunchAgent: true,
  enableMorningBrief: true,
  morningBriefPrompt: 'Morning brief. 3 lines max per section.\n1. What matters today\n2. Calendar top 3\n3. Open loops to close',
  morningBriefCron: '0 9 * * *',
  voiceSource: 'online',
  skillPack: [
    'karpathy-guidelines', 'find-skills', 'find-mcp', 'research',
    'checkpoint', 'think', 'self-improving', 'simplify',
    'vault-audit', 'update-config', 'fewer-permission-prompts',
  ],
  optionalSkills: [],
}
