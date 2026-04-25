import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Step {
  do: string
  detail?: string
  pasteHere?: string
}

interface Doc {
  title: string
  intro: string
  steps: Step[]
  troubleshoot?: { problem: string; fix: string }[]
}

const PROVIDERS: Record<string, Doc> = {
  telegram: {
    title: 'Telegram bot token',
    intro: 'A Telegram bot is a free account type. Free forever. Takes 60 seconds.',
    steps: [
      { do: 'Open Telegram on your phone or desktop.', detail: 'If you do not have it: telegram.org/download.' },
      { do: 'In the search bar at the top, type @BotFather.', detail: 'Tap the one with the blue tick.' },
      { do: 'Press Start. You will see a menu of commands.' },
      { do: 'Send the message: /newbot' },
      { do: 'BotFather asks for a display name. Type any name you like.', detail: 'e.g. "My Brain". This is what shows above the chat.' },
      { do: 'BotFather asks for a username. Must end in "bot".', detail: 'e.g. "my_brain_bot". If taken, try another.' },
      { do: 'BotFather replies with a long string starting with numbers and a colon.', pasteHere: 'TELEGRAM_BOT_TOKEN' },
      { do: 'Copy that string. Paste into the wizard field labelled "Telegram bot token".' },
    ],
    troubleshoot: [
      { problem: 'Username already taken', fix: 'Try another username with "bot" at the end. Add numbers if needed.' },
      { problem: 'BotFather did not reply', fix: 'Send /newbot again. Sometimes the message gets lost.' },
    ],
  },

  groq: {
    title: 'Groq API key (voice transcription)',
    intro: 'Groq runs Whisper for free. You only need this if you want to send voice notes to your bot. Skip otherwise.',
    steps: [
      { do: 'Open https://console.groq.com in your browser.' },
      { do: 'Click Sign Up. Use Google or email, whichever is easier.' },
      { do: 'Once logged in, look at the left sidebar.' },
      { do: 'Click API Keys.' },
      { do: 'Click Create API Key. Name it "nello-claw".' },
      { do: 'Groq shows the key once. Copy it now.', detail: 'If you close the dialog you cannot see it again. You will have to make another one.' },
      { do: 'Paste into the wizard field labelled "Groq API key".', pasteHere: 'GROQ_API_KEY' },
    ],
    troubleshoot: [
      { problem: 'I closed the dialog before copying', fix: 'Go back to API Keys, click Create API Key again. Make a new one.' },
      { problem: 'Says "rate limit exceeded" later', fix: 'Free tier resets daily. Wait a few hours or upgrade.' },
    ],
  },

  google: {
    title: 'Google Workspace OAuth (Gmail / Drive / Docs / Sheets / Calendar)',
    intro: 'This lets Claude read and write your Google Workspace stuff. Takes 5-10 minutes the first time. Free.',
    steps: [
      { do: 'Open https://console.cloud.google.com in your browser.' },
      { do: 'Sign in with the Google account you want Claude to access.', detail: 'Use the email you actually use day-to-day.' },
      { do: 'At the top, click the project dropdown. If you have no projects, click New Project.', detail: 'Name it "nello-claw". Leave organisation as default.' },
      { do: 'Wait for the project to create. Switch to it via the dropdown.' },
      { do: 'In the search bar at top, type "APIs and Services". Click Library.' },
      { do: 'Search for and enable each: Gmail API, Google Drive API, Google Docs API, Google Sheets API, Google Calendar API.', detail: 'Click each one, then Enable. One at a time.' },
      { do: 'Now in the search bar type "OAuth consent screen". Click it.' },
      { do: 'Pick External. Click Create.' },
      { do: 'Fill in: app name "nello-claw", user support email = your email, developer contact = your email. Save.' },
      { do: 'Skip Scopes screen by clicking Save and Continue.' },
      { do: 'On Test Users page, add your own email. This lets you test without publishing.' },
      { do: 'Back in search, type "Credentials". Click it.' },
      { do: 'Click Create Credentials → OAuth client ID.' },
      { do: 'Pick Desktop app as the application type. Name it "nello-claw". Click Create.' },
      { do: 'Google shows a dialog with Client ID and Client Secret. Copy both.', pasteHere: 'GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET' },
      { do: 'Paste into the wizard fields. Also enter the email you signed in with.' },
    ],
    troubleshoot: [
      { problem: 'API enable button is greyed out', fix: 'Make sure you switched to the right project at the top.' },
      { problem: 'OAuth consent screen says "verification required"', fix: 'Pick External, mark as Testing, add yourself as a Test User. You do not need to publish.' },
      { problem: 'On first MCP run a browser opens asking for consent', fix: 'That is expected. Click your account, allow access. Token caches after first time.' },
    ],
  },

  tavily: {
    title: 'Tavily API key (research skill)',
    intro: 'Tavily does AI-friendly web search. Used by the research skill. Free tier is plenty for personal use.',
    steps: [
      { do: 'Open https://tavily.com in your browser.' },
      { do: 'Click Sign Up. Use Google or GitHub for fastest signup.' },
      { do: 'After signup you land on the dashboard.' },
      { do: 'Look for the API Key panel. The key starts with "tvly-".' },
      { do: 'Click the copy icon next to the key.', pasteHere: 'TAVILY_API_KEY' },
      { do: 'Paste into the wizard field labelled "Tavily API key".' },
    ],
  },

  exa: {
    title: 'Exa API key (research skill)',
    intro: 'Exa is semantic web search built for LLMs. Used by the research skill. Free tier covers casual use.',
    steps: [
      { do: 'Open https://exa.ai in your browser.' },
      { do: 'Click Get API Key (top right) or go directly to dashboard.exa.ai.' },
      { do: 'Sign up with Google or email.' },
      { do: 'On the dashboard, click API Keys in the left sidebar.' },
      { do: 'Click Create New Key. Name it "nello-claw".' },
      { do: 'Copy the key. It starts with random characters.', pasteHere: 'EXA_API_KEY' },
      { do: 'Paste into the wizard field labelled "Exa API key".' },
    ],
  },

  firecrawl: {
    title: 'Firecrawl API key (research + scraping skill)',
    intro: 'Firecrawl turns any URL into clean markdown for Claude. Free tier = 500 pages a month.',
    steps: [
      { do: 'Open https://firecrawl.dev in your browser.' },
      { do: 'Click Sign Up at the top right.' },
      { do: 'Sign up with Google or email.' },
      { do: 'Once logged in, click your avatar (top right) and pick API Keys.' },
      { do: 'A key is auto-generated. Click the copy icon next to it.', pasteHere: 'FIRECRAWL_API_KEY' },
      { do: 'Paste into the wizard field labelled "Firecrawl API key".' },
    ],
  },
}

export default async function ProviderDoc({ params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params
  const doc = PROVIDERS[provider]
  if (!doc) notFound()

  return (
    <div className="hero" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 36 }}>{doc.title}</h1>
      <p style={{ fontSize: 17, color: 'var(--muted)' }}>{doc.intro}</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>Steps</h2>
      <ol style={{ paddingLeft: 24, lineHeight: 1.9 }}>
        {doc.steps.map((s, i) => (
          <li key={i} style={{ marginBottom: 14 }}>
            <div>{s.do}</div>
            {s.detail && <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{s.detail}</div>}
            {s.pasteHere && (
              <div style={{ marginTop: 4, fontSize: 12, color: 'var(--accent)' }}>
                → paste into <code>{s.pasteHere}</code>
              </div>
            )}
          </li>
        ))}
      </ol>

      {doc.troubleshoot && (
        <>
          <h2 style={{ fontSize: 18, marginTop: 32 }}>If something goes wrong</h2>
          <ul style={{ paddingLeft: 24, lineHeight: 1.7 }}>
            {doc.troubleshoot.map((t, i) => (
              <li key={i} style={{ marginBottom: 10 }}>
                <strong>{t.problem}</strong> — {t.fix}
              </li>
            ))}
          </ul>
        </>
      )}

      <p style={{ marginTop: 40 }}>
        <Link href="/docs">← back to docs</Link>{'  '}|{'  '}
        <Link href="/wizard">continue the wizard →</Link>
      </p>
    </div>
  )
}
