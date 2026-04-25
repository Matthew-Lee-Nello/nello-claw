/**
 * nello-claw course content. Hardcoded for v1, CMS later.
 * Each Lesson has a body of typed blocks - rendered by LessonBody in Courses.tsx.
 */

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; text: string }
  | { type: 'callout'; title?: string; text: string; tone?: 'info' | 'warn' | 'tip' }

export interface Lesson {
  id: string
  number: number
  title: string
  duration?: string
  body: Block[]
}

export interface Module {
  id: string
  number: number
  title: string
  intro?: string
  lessons: Lesson[]
}

export const COURSE: Module[] = [
  {
    id: 'm1',
    number: 1,
    title: 'Set up your tools',
    lessons: [
      {
        id: 'm1-l1', number: 1, title: 'Install VS Code', duration: '3 min',
        body: [
          { type: 'p', text: 'VS Code is a free code editor from Microsoft. Your assistant lives inside it. We need it before anything else.' },
          { type: 'h', text: 'Steps' },
          { type: 'ol', items: [
            'Open your browser, go to https://code.visualstudio.com',
            'Click the big blue "Download for Mac" or "Download for Windows" button',
            'Open the downloaded file. Mac: drag VS Code to Applications. Windows: run the installer, click Next, Next, Install.',
            'Open VS Code from Applications (Mac) or Start Menu (Windows)',
          ]},
          { type: 'callout', tone: 'tip', title: 'Done when:', text: 'You see the VS Code welcome screen with a blue logo.' },
          { type: 'callout', tone: 'info', title: 'Stuck?', text: 'Google "how to install vs code on Mac" or "...on Windows". 30 seconds, problem solved.' },
        ],
      },
      {
        id: 'm1-l2', number: 2, title: 'Install Claude Code', duration: '3 min',
        body: [
          { type: 'p', text: 'Claude Code is the AI that does the actual work. Free with any Claude.ai plan.' },
          { type: 'h', text: 'Steps' },
          { type: 'ol', items: [
            'In VS Code: top menu → View → Extensions',
            'Search bar: type "Claude Code"',
            'Click Install on the official Anthropic one (verified blue checkmark)',
            'After install, look at the left sidebar - new icon (Claude logo). Click it.',
            'Sign in with your Claude.ai account (the one you use at claude.ai)',
            'Approve the browser popup that asks "let Claude Code access your account"',
          ]},
          { type: 'callout', tone: 'tip', title: 'Done when:', text: 'You see a chat box in VS Code that says "Ask anything..."' },
        ],
      },
      {
        id: 'm1-l3', number: 3, title: 'Make your assistant a home', duration: '2 min',
        body: [
          { type: 'p', text: 'Pick where on your computer you want your assistant to live. Anywhere - Desktop, Documents, a dedicated folder, your call. The install will go INTO that folder.' },
          { type: 'h', text: 'Steps' },
          { type: 'ol', items: [
            'Open Finder (Mac) or File Explorer (Windows)',
            'Go to where you want it (e.g. Documents, Desktop, or your home folder)',
            'Right-click → New Folder → name it whatever you want (e.g. my-assistant, brain, claw). Avoid spaces.',
            'Back in VS Code: File menu → Open Folder → pick the folder you just made',
            'VS Code asks "Do you trust the authors?" - Yes (you made it).',
          ]},
          { type: 'callout', tone: 'tip', title: 'Done when:', text: 'VS Code window title shows your folder name' },
          { type: 'callout', tone: 'info', title: 'Why this matters', text: 'When you run the install command later, it installs into whatever folder VS Code has open. So pick the right folder NOW.' },
        ],
      },
    ],
  },

  {
    id: 'm2',
    number: 2,
    title: 'Get your keys',
    lessons: [
      {
        id: 'm2-l1', number: 1, title: 'Telegram bot key', duration: '2 min',
        body: [
          { type: 'p', text: 'So your assistant can text you on your phone.' },
          { type: 'p', text: 'Skip if: you don\'t want phone access, only the Mac dashboard.' },
          { type: 'h', text: 'Steps' },
          { type: 'ol', items: [
            'Open Telegram on your phone or desktop. If you don\'t have it: telegram.org/download',
            'Search bar at the top: type @BotFather. Tap the one with the blue tick.',
            'Press Start',
            'Send: /newbot',
            'BotFather asks for a display name: type anything. e.g. "My Brain"',
            'BotFather asks for a username: must end in "bot". e.g. my_brain_bot. If taken, add numbers.',
            'BotFather replies with a long string starting with numbers and a colon',
            'Copy the whole string. Save in Apple Notes or 1Password.',
          ]},
          { type: 'callout', tone: 'warn', title: 'Stuck?', text: '"Username already taken" → try mattbrainbot, mattbrainbot2, etc. "BotFather didn\'t reply" → resend /newbot.' },
        ],
      },
      {
        id: 'm2-l2', number: 2, title: 'Groq key (voice)', duration: '2 min',
        body: [
          { type: 'p', text: 'Lets your assistant understand voice notes you send. Free tier is generous.' },
          { type: 'p', text: 'Skip if: you only ever text, never voice-note.' },
          { type: 'h', text: 'Steps' },
          { type: 'ol', items: [
            'Browser → https://console.groq.com',
            'Click Sign Up (Google login is fastest)',
            'Once in the dashboard, click API Keys in the left sidebar',
            'Click Create API Key. Name it "nello-claw".',
            'Copy the key NOW. If you close the popup before copying, you have to make a new one.',
            'Save it in Apple Notes / 1Password.',
          ]},
          { type: 'callout', tone: 'warn', title: 'Closed before copying?', text: 'Go back to API Keys, hit Create API Key again. Make a new one.' },
        ],
      },
      {
        id: 'm2-l3', number: 3, title: 'Google Workspace (Gmail / Drive / Calendar)', duration: '10 min',
        body: [
          { type: 'p', text: 'Lets your assistant read your email, write docs, manage your calendar. Free, but the longest setup. Take your time.' },
          { type: 'callout', tone: 'tip', title: 'Estimated time', text: '10 minutes the first time. Never again.' },
          { type: 'h', text: 'Part 1: Make a project' },
          { type: 'ol', items: [
            'Browser → https://console.cloud.google.com',
            'Sign in with your day-to-day Gmail',
            'Top of page, click the project dropdown. If empty, click "New Project". Name it nello-claw.',
            'Wait for the project to be created. Switch to it via the dropdown.',
          ]},
          { type: 'h', text: 'Part 2: Enable 5 APIs' },
          { type: 'p', text: 'Search bar at the top: type "APIs and Services". Click Library.' },
          { type: 'p', text: 'For each of these, search, click, click Enable:' },
          { type: 'ul', items: [
            'Gmail API',
            'Google Drive API',
            'Google Docs API',
            'Google Sheets API',
            'Google Calendar API',
          ]},
          { type: 'h', text: 'Part 3: OAuth consent screen' },
          { type: 'ol', items: [
            'Search "OAuth consent screen". Click it.',
            'Pick External. Click Create.',
            'Fill: app name "nello-claw", your email twice (support + developer).',
            'Skip Scopes screen by clicking Save and Continue',
            'On Test Users page, click Add Users, add YOUR own email. This is critical.',
          ]},
          { type: 'h', text: 'Part 4: Get the keys' },
          { type: 'ol', items: [
            'Search "Credentials". Click it.',
            'Click Create Credentials → OAuth client ID',
            'Application type: Desktop app. Name it nello-claw. Click Create.',
            'Popup shows Client ID and Client Secret. Copy both. Save somewhere safe.',
          ]},
          { type: 'callout', tone: 'warn', title: 'Common stuck points', text: '"Enable button greyed out" - you didn\'t switch to the right project. Switch. "Verification required" - ignore, you\'re a Test User. "Where do I download the JSON?" - you don\'t. Just copy the ID and Secret.' },
        ],
      },
      {
        id: 'm2-l4', number: 4, title: 'Research keys (optional)', duration: '5 min',
        body: [
          { type: 'p', text: 'These three add web research powers. All free tiers. Skip all three if you only want email + calendar.' },
          { type: 'h', text: 'Tavily (1 min)' },
          { type: 'ol', items: ['Go to https://tavily.com', 'Sign up', 'Copy the key from the API Keys panel'] },
          { type: 'h', text: 'Exa (1 min)' },
          { type: 'ol', items: ['Go to https://dashboard.exa.ai', 'Sign up', 'API Keys → Create New Key → copy'] },
          { type: 'h', text: 'Firecrawl (1 min)' },
          { type: 'ol', items: ['Go to https://firecrawl.dev', 'Sign up', 'Avatar (top right) → API Keys → copy'] },
        ],
      },
      {
        id: 'm2-l5', number: 5, title: 'Where to keep your keys safe', duration: '2 min',
        body: [
          { type: 'h', text: 'Do' },
          { type: 'ul', items: [
            'Apple Notes / Google Keep (encrypted at rest if your device is locked)',
            '1Password / Bitwarden / iCloud Keychain - proper password managers',
            'A plain text file in your Mac Home folder (FileVault encrypts it)',
          ]},
          { type: 'h', text: 'Do not' },
          { type: 'ul', items: [
            'Send them in iMessage or text',
            'Email them to yourself unencrypted',
            'Paste them in Slack / Discord / public chat',
            'Push them to GitHub',
          ]},
        ],
      },
    ],
  },

  {
    id: 'm3',
    number: 3,
    title: 'Run the wizard',
    lessons: [
      {
        id: 'm3-l1', number: 1, title: 'Open the wizard', duration: '1 min',
        body: [
          { type: 'ol', items: [
            'Browser → https://labs.nello.gg',
            'Click "Set up my assistant"',
          ]},
          { type: 'p', text: "That's it. Now you're at screen 1 of 7." },
        ],
      },
      {
        id: 'm3-l2', number: 2, title: 'Walk through 7 screens', duration: '5 min',
        body: [
          { type: 'p', text: 'Quick guide. Most fields are self-explanatory - this is the gotchas.' },
          { type: 'ul', items: [
            'About you - name, assistant name, language. Pick "blunt" if you hate fluff, "warm" for friendly.',
            'What you do - role, projects (up to 5, name + one-liner), apps you use day-to-day.',
            'People in your world - team, clients, mentors. All optional.',
            "Your notes - pick Standard if unsure. Other options are for note-taking nerds.",
            'How they sound - em-dash policy (pick "never"), banned words.',
            'Connections - paste the keys from Module 2. Tick what you want.',
            'Last bits - Telegram, dashboard, auto-start, morning brief, voice. Defaults are sensible.',
          ]},
        ],
      },
      {
        id: 'm3-l3', number: 3, title: 'Build my brain', duration: '1 min',
        body: [
          { type: 'p', text: 'Click the big button. A file called nello-claw-bundle.json downloads to your Downloads folder within 2 seconds.' },
          { type: 'p', text: "The wizard now shows a prompt. Don't paste it yet. Read Module 4 first." },
        ],
      },
    ],
  },

  {
    id: 'm4',
    number: 4,
    title: 'Install your assistant',
    lessons: [
      {
        id: 'm4-l1', number: 1, title: 'Switch to Plan Mode', duration: '1 min',
        body: [
          { type: 'callout', tone: 'tip', title: 'Why', text: "Makes your assistant tell you EXACTLY what it's about to do BEFORE doing anything. You approve before any change touches your machine." },
          { type: 'ol', items: [
            'Open VS Code with the nello-claw folder you made (lesson 1.3)',
            'Click the Claude icon in the left sidebar',
            'Hit Shift+Tab twice. A small badge appears: "plan mode"',
          ]},
        ],
      },
      {
        id: 'm4-l2', number: 2, title: 'Paste the install prompt', duration: '1 min',
        body: [
          { type: 'ol', items: [
            'Go back to the wizard tab',
            'Click the prompt box (it copies). Or click "Copy to clipboard".',
            'Switch back to VS Code',
            'Paste into the Claude chat box',
            'Hit Enter',
          ]},
          { type: 'p', text: "Your assistant thinks for 10-30 seconds, then writes you a plan." },
        ],
      },
      {
        id: 'm4-l3', number: 3, title: 'Read the plan, approve it', duration: '2 min',
        body: [
          { type: 'p', text: 'The plan should mention:' },
          { type: 'ul', items: [
            'Cloning a repo from github.com/Matthew-Lee-Nello/nello-claw',
            'Running pnpm install and pnpm build',
            'Running bootstrap.js to set up your folder',
            '(Optionally) installing a service so your assistant auto-starts',
          ]},
          { type: 'callout', tone: 'warn', title: "If anything looks weird", text: "Wants to delete files outside your nello-claw folder? Wants admin access for something unexpected? Mentions a different repo? Don't approve. Open an issue at github.com/Matthew-Lee-Nello/nello-claw/issues." },
          { type: 'p', text: "If it looks normal, hit Approve." },
        ],
      },
      {
        id: 'm4-l4', number: 4, title: 'Wait + watch', duration: '5 min',
        body: [
          { type: 'p', text: 'Your assistant runs through:' },
          { type: 'ul', items: [
            '~30 sec: cloning the repo',
            '~1-2 min: pnpm install (downloads dependencies)',
            '~30 sec: pnpm build (compiles)',
            '~5 sec: bootstrap (writes your CLAUDE.md, .env, vault)',
            '~5 sec: registering auto-start service',
            '~10 sec: audit (checks everything\'s in place)',
          ]},
          { type: 'callout', tone: 'tip', title: 'Total: 3-5 minutes', text: 'Good time to make a coffee.' },
        ],
      },
      {
        id: 'm4-l5', number: 5, title: 'First login', duration: '1 min',
        body: [
          { type: 'p', text: "When the install finishes, your assistant prints \"Done.\" and tells you the dashboard URL." },
          { type: 'ol', items: [
            'Browser → http://localhost:3000',
            'You see a chat window',
            'Type "hi" - your assistant replies',
          ]},
          { type: 'p', text: "Dashboard didn't open? Check Module 7 (Troubleshooting)." },
        ],
      },
    ],
  },

  {
    id: 'm5',
    number: 5,
    title: 'Connect your phone',
    lessons: [
      {
        id: 'm5-l1', number: 1, title: 'Find your bot in Telegram', duration: '1 min',
        body: [
          { type: 'ol', items: [
            'Open Telegram on your phone',
            'Search the username you gave it (e.g. my_brain_bot)',
            'Tap the bot, hit Start',
          ]},
        ],
      },
      {
        id: 'm5-l2', number: 2, title: 'Send anything', duration: '1 min',
        body: [
          { type: 'p', text: "Type 'hi' or whatever. Hit send." },
          { type: 'p', text: "Within 5 seconds your bot replies: \"Hi {your name}. I'm connected. Restarting now to load your config - one second.\"" },
          { type: 'p', text: "After ~10 seconds it'll be ready. Send another message: \"what's the weather in Brisbane today?\" Real reply now." },
          { type: 'callout', tone: 'tip', title: "That's it.", text: "You have an AI executive assistant in your pocket." },
        ],
      },
    ],
  },

  {
    id: 'm6',
    number: 6,
    title: 'Daily use',
    lessons: [
      {
        id: 'm6-l1', number: 1, title: 'Three surfaces, same brain', duration: '2 min',
        body: [
          { type: 'p', text: "Talk to your assistant from three places. They all share the same memory:" },
          { type: 'ul', items: [
            'Dashboard (http://localhost:3000) - best for long tasks, file uploads, watching it work',
            'Telegram - best for on-the-go, voice notes, quick answers',
            'VS Code Claude Code - best when you want to work IN code with it',
          ]},
          { type: 'p', text: 'Whatever you tell it in one place, it remembers in the others.' },
        ],
      },
      {
        id: 'm6-l2', number: 2, title: 'Try these first', duration: '5 min',
        body: [
          { type: 'ul', items: [
            "Read the latest 5 emails in my inbox and summarise them",
            "What's on my calendar tomorrow?",
            "Create a Google Doc called 'Q4 Plan' with sections: Goals, Risks, Actions",
            "Remember that my main client is Acme Corp",
            "(Tomorrow, fresh chat) What did I tell you about Acme Corp?",
          ]},
        ],
      },
      {
        id: 'm6-l3', number: 3, title: 'The morning briefing', duration: '2 min',
        body: [
          { type: 'p', text: "If you ticked the box, every day at 9am your bot sends a Telegram message:" },
          { type: 'ul', items: [
            "What matters today (from your inbox + notes)",
            "Calendar top 3",
            "Open loops to close",
          ]},
          { type: 'p', text: "Edit it: Cron tab → click the morning brief task." },
        ],
      },
      {
        id: 'm6-l4', number: 4, title: 'Adding more abilities', duration: '3 min',
        body: [
          { type: 'p', text: "Your assistant ships with 7 built-in abilities. Add more by saying:" },
          { type: 'code', text: 'find me a skill that can <thing>' },
          { type: 'p', text: "It searches the open ecosystem, recommends one, asks if you want to install. You say yes, it installs." },
        ],
      },
      {
        id: 'm6-l5', number: 5, title: 'Adding more connections', duration: '3 min',
        body: [
          { type: 'p', text: "Want it to access Notion / Linear / GitHub / anything else?" },
          { type: 'code', text: 'find me a connection (MCP) for <service>' },
          { type: 'p', text: "It finds the right one, walks you through getting the keys, installs it." },
        ],
      },
    ],
  },

  {
    id: 'm7',
    number: 7,
    title: 'When stuck',
    lessons: [
      {
        id: 'm7-l1', number: 1, title: 'The roadblock rule', duration: '3 min',
        body: [
          { type: 'p', text: "If something doesn't work, do this in order. Most stop at step 1." },
          { type: 'ol', items: [
            'Google AI mode. Go to https://www.google.com/search?q=YOUR+ERROR&udm=50 (or google.com → click the AI icon → paste your error). Read the answer. 80% of problems solved.',
            'Ask your assistant. Open the dashboard, paste the error, ask "what does this mean and how do I fix it?". Your assistant reads your logs and tells you.',
            'Run the doctor. Open VS Code Terminal in your nello-claw folder: pnpm doctor. It checks every part of your setup.',
            'Read the log: tail -50 ~/nello-claw/store/server.log',
            'Open a GitHub issue. Last resort. github.com/Matthew-Lee-Nello/nello-claw/issues',
          ]},
        ],
      },
      {
        id: 'm7-l2', number: 2, title: 'Common errors + fixes', duration: '3 min',
        body: [
          { type: 'h', text: '"Port 3000 already in use"' },
          { type: 'p', text: "Something else is using port 3000. Edit ~/nello-claw/.env, set DASHBOARD_PORT=3030, restart." },
          { type: 'h', text: '"401 Unauthorized" from Telegram' },
          { type: 'p', text: "Bot token wrong or revoked. Generate a new one from @BotFather, paste into .env." },
          { type: 'h', text: '"Token expired" Google' },
          { type: 'p', text: "Re-auth. Dashboard → Settings → Reconnect Google." },
          { type: 'h', text: 'Bot stopped replying' },
          { type: 'p', text: "Restart it." },
          { type: 'code', text: 'launchctl kickstart -k gui/$(id -u)/com.nello-claw.server' },
        ],
      },
    ],
  },

  {
    id: 'm8',
    number: 8,
    title: 'Advanced',
    lessons: [
      {
        id: 'm8-l1', number: 1, title: 'Schedule your own tasks', duration: '3 min',
        body: [
          { type: 'p', text: "Just tell your assistant:" },
          { type: 'code', text: 'every Monday at 8am, brief me on last week\'s emails and what\'s still open' },
          { type: 'p', text: "Done. The assistant creates a scheduled task. View / edit them in the Cron tab." },
        ],
      },
      {
        id: 'm8-l2', number: 2, title: 'Build your own skills', duration: '5 min',
        body: [
          { type: 'p', text: "A skill is a markdown file telling Claude how to do something. You can write your own." },
          { type: 'code', text: 'create a skill that turns any meeting recording into a deal summary in my Notion' },
          { type: 'p', text: "Your assistant writes the skill file, installs it, you can use it forever." },
        ],
      },
      {
        id: 'm8-l3', number: 3, title: 'Connect your own tools', duration: '5 min',
        body: [
          { type: 'p', text: "If you have an API for anything, your assistant can wrap it as a connection." },
          { type: 'code', text: 'wire up our company API at api.acme.com so you can pull our sales numbers' },
          { type: 'p', text: "Walks through it." },
        ],
      },
    ],
  },

  {
    id: 'm9',
    number: 9,
    title: 'Tips & tricks',
    lessons: [
      {
        id: 'm9-l1', number: 1, title: 'Forking conversations', duration: '3 min',
        body: [
          { type: 'p', text: "One of the most underused features in Claude Code. Fork lets you branch your current chat at any point - all context up to that moment carries over, but new messages only go to the new branch. You end up with multiple parallel threads sharing the same setup." },

          { type: 'h', text: "Why it matters" },
          { type: 'p', text: "Most people use Claude Code as one long chat. Halfway through a task, you remember an unrelated question. You either:" },
          { type: 'ul', items: [
            "Derail the main thread with a side question (loses focus)",
            "Open a new chat with no context (loses memory)",
            "Mentally hold the question (forget it later)",
          ]},
          { type: 'p', text: "Forking solves all three. Branch off, ask the side question, the main thread is untouched. Come back when you want." },

          { type: 'h', text: "When to fork" },
          { type: 'ul', items: [
            "Mid-task you remember an unrelated question",
            "Want to try two different approaches to the same problem - fork twice, run them in parallel, compare",
            "Want to explore a 'what if' without committing",
            "Trying a risky operation - fork first, if it goes badly, switch back to the main thread",
            "Long task and you need to handle a quick interruption - fork, deal, return",
          ]},

          { type: 'h', text: "How to fork" },
          { type: 'p', text: "In Claude Code (VS Code or terminal):" },
          { type: 'ol', items: [
            "Hit Cmd+Shift+F (Mac) or Ctrl+Shift+F (Windows)",
            "OR right-click any message in the conversation history and pick 'Fork from here'",
            "Name the fork so you can find it later (e.g. 'research path A')",
            "New thread opens with all context up to that point",
          ]},

          { type: 'h', text: "Switching between forks" },
          { type: 'p', text: "The conversation history dropdown shows all your active threads. Click one to switch. Each thread keeps its own message history but they share everything that happened BEFORE the fork point." },

          { type: 'callout', tone: 'tip', title: "Pro move", text: "Fork three ways on a hard problem. Thread A: 'do it the simple way'. Thread B: 'do it the proper engineering way'. Thread C: 'what would Hormozi/Karpathy/etc do here'. Compare in 10 minutes." },

          { type: 'callout', tone: 'info', title: "Memory shared, threads separate", text: "Anything saved to your assistant's long-term memory (auto-memory files, vault notes) is shared across all forks. Conversation messages stay separate." },
        ],
      },
    ],
  },
]
