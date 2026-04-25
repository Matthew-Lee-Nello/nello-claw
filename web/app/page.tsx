import Link from 'next/link'

export default function Landing() {
  return (
    <div className="hero">
      <h1><span>nello-claw</span></h1>
      <p style={{ fontSize: 22, color: 'var(--text)', marginBottom: 12 }}>
        Your Claude Code brain. One paste, ten minutes, done.
      </p>
      <p>
        Answer seven questions. Paste your API keys. Click build. Paste one line into Claude Code.
        Get Telegram bot, web dashboard, Obsidian vault, Google Workspace MCP, hooks, skill pack
        and a LaunchAgent running on your Mac.
      </p>
      <p>
        All compilation happens in your browser. Your keys never hit our server.
      </p>
      <div className="cta">
        <Link href="/wizard"><button>Fresh install (wizard)</button></Link>
        <Link href="/audit"><button className="secondary">I already have Claude Code</button></Link>
      </div>
      <p style={{ marginTop: 48, fontSize: 13 }}>
        <Link href="/docs">How it works →</Link>
      </p>
    </div>
  )
}
