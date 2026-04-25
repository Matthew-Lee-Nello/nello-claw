import Link from 'next/link'

export default function Docs() {
  return (
    <div className="hero">
      <h1>How it works</h1>
      <p>
        <strong>nello-claw</strong> is a Claude Code stack personalised to you. The wizard
        collects identity, work, people, vault taxonomy, voice rules, API keys and surface
        preferences. Your browser compiles a bundle locally - no LLM call, just template
        substitution. The installer clones the repo, runs bootstrap, wires Telegram +
        dashboard + LaunchAgent, installs the skill pack, you are done.
      </p>

      <h2>API key step-by-step (for-baby guides)</h2>
      <ul>
        <li><Link href="/docs/telegram">Telegram bot token</Link> — required, 60 seconds, free</li>
        <li><Link href="/docs/groq">Groq (voice transcription)</Link> — optional, 2 minutes, free tier</li>
        <li><Link href="/docs/google">Google Workspace OAuth</Link> — optional, 5-10 minutes, free</li>
        <li><Link href="/docs/tavily">Tavily (research)</Link> — optional, 1 minute, free tier</li>
        <li><Link href="/docs/exa">Exa (research)</Link> — optional, 1 minute, free tier</li>
        <li><Link href="/docs/firecrawl">Firecrawl (research + scraping)</Link> — optional, 1 minute, free tier</li>
      </ul>

      <p style={{ marginTop: 40 }}>
        <Link href="/wizard"><button>Start the wizard</button></Link>{' '}
        <Link href="/audit"><button className="secondary">Already have Claude Code? Audit instead</button></Link>
      </p>
    </div>
  )
}
