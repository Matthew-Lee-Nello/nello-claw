export interface Project { name: string; description: string; slug?: string }
export interface Person { name: string; role?: string; relationship?: string; slug?: string }
export interface Client { name: string; status: string; slug?: string }
export interface CustomPrefix { prefix: string; description: string }

export interface Bundle {
  // Screen 1 - Identity
  name: string
  assistantName: string
  timezone: string
  location: string
  age?: string
  values: string[]
  faith?: string
  communicationStyle: 'blunt' | 'warm' | 'formal' | 'casual'
  language: 'AU' | 'US' | 'UK' | 'other'

  // Screen 2 - Work
  role: string
  company: string
  industry: string
  projects: Project[]
  targetCustomer: string
  services: string[]
  tools: string[]

  // Screen 3 - People
  teamMembers: Person[]
  clients: Client[]
  mentors: Person[]

  // Screen 4 - Vault
  vaultPreset: 'nello' | 'para' | 'zettelkasten' | 'custom'
  vaultPath: string
  customPrefixes?: CustomPrefix[]
  graphifyEnabled: boolean

  // Screen 5 - Voice
  emDashPolicy: 'never' | 'sparingly' | 'free'
  oxfordComma: boolean
  bannedWords: string[]
  enableHumanizer: boolean
  enableKarpathyGuidelines: boolean
  enableAiHumanizer: boolean

  // Screen 6 - Keys + MCPs
  keys: Record<string, string>
  mcps: {
    google?: boolean
    obsidian?: boolean
    tavily?: boolean
    exa?: boolean
    firecrawl?: boolean
    gitnexus?: boolean
    apify?: boolean
    n8n?: boolean
  }

  // Screen 7 - Surfaces + Automation
  installTelegram: boolean
  installDashboard: boolean
  installLaunchAgent: boolean
  enableMorningBrief: boolean
  morningBriefPrompt: string
  morningBriefCron: string
  voiceSource: 'online' | 'local' | 'off'
  skillPack: string[]
  optionalSkills: string[]
}

export type Screen = 1 | 2 | 3 | 4 | 5 | 6 | 7
