import Link from 'next/link'

export default function Docs() {
  return (
    <div className="hero">
      <h1>How it works</h1>
      <p style={{ fontSize: 18, color: 'var(--text)' }}>
        nello-claw is your own AI executive assistant. They live on your Mac, know everything
        you tell them, and just do the work.
      </p>
      <p>
        You answer seven quick questions about who you are, what you do, who is in your
        world, and how you like things done. We bundle that into a setup file. You paste
        one line into Claude Code and your assistant is up in about ten minutes.
      </p>

      <h2 style={{ marginTop: 32 }}>What stays on your Mac</h2>
      <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>
        <li>Every key you paste into the wizard - never sent to us</li>
        <li>Every conversation you have with your assistant</li>
        <li>Your notes, your memory, your context - all local</li>
      </ul>

      <h2 style={{ marginTop: 32 }}>Connecting your accounts (step-by-step guides)</h2>
      <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>
        <li><Link href="/docs/telegram">Telegram</Link> - so your assistant can text you anywhere. Free, takes 60 seconds.</li>
        <li><Link href="/docs/groq">Groq</Link> - so your assistant can hear voice notes. Free, takes 2 minutes.</li>
        <li><Link href="/docs/google">Google Workspace</Link> - Gmail, Drive, Docs, Calendar. Free, takes 5-10 minutes.</li>
        <li><Link href="/docs/tavily">Tavily</Link> - live web research. Free tier, 1 minute.</li>
        <li><Link href="/docs/exa">Exa</Link> - smarter web search. Free tier, 1 minute.</li>
        <li><Link href="/docs/firecrawl">Firecrawl</Link> - read any website. Free tier, 1 minute.</li>
      </ul>

      <p style={{ marginTop: 40 }}>
        <Link href="/wizard"><button>Set up my assistant</button></Link>{' '}
        <Link href="/audit"><button className="secondary">I already have a setup</button></Link>
      </p>
    </div>
  )
}
