import { describe, it, expect } from 'vitest'
import { formatForTelegram, splitMessage } from '../src/format.js'

describe('formatForTelegram', () => {
  it('converts bold', () => {
    expect(formatForTelegram('**hello**')).toBe('<b>hello</b>')
  })

  it('converts italic', () => {
    expect(formatForTelegram('this is *italic* word')).toContain('<i>italic</i>')
  })

  it('converts inline code', () => {
    expect(formatForTelegram('use `npm install`')).toContain('<code>npm install</code>')
  })

  it('converts code blocks to <pre>', () => {
    const out = formatForTelegram('```js\nconst x = 1\n```')
    expect(out).toContain('<pre>')
    expect(out).toContain('const x = 1')
  })

  it('converts links', () => {
    expect(formatForTelegram('[click](https://example.com)')).toContain('<a href="https://example.com">click</a>')
  })

  it('converts heading to bold', () => {
    expect(formatForTelegram('## Heading')).toContain('<b>Heading</b>')
  })

  it('converts checkboxes', () => {
    const out = formatForTelegram('- [ ] todo\n- [x] done')
    expect(out).toContain('☐')
    expect(out).toContain('☑')
  })

  it('escapes html in plain text', () => {
    expect(formatForTelegram('a > b < c & d')).toContain('a &gt; b &lt; c &amp; d')
  })

  it('strips horizontal rules', () => {
    expect(formatForTelegram('one\n---\ntwo')).not.toContain('---')
  })
})

describe('splitMessage', () => {
  it('returns single chunk if under limit', () => {
    expect(splitMessage('short', 100)).toEqual(['short'])
  })

  it('splits on newlines when over limit', () => {
    const text = 'a'.repeat(50) + '\n' + 'b'.repeat(50) + '\n' + 'c'.repeat(50)
    const chunks = splitMessage(text, 80)
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.every(c => c.length <= 80)).toBe(true)
  })

  it('never breaks mid-word', () => {
    const text = 'hello world foo bar baz qux'.repeat(5)
    const chunks = splitMessage(text, 50)
    for (const chunk of chunks) {
      // Check no chunk cuts "hello" or other words mid-word
      expect(chunk).not.toMatch(/[a-z]$/i) // ends on space or punct, not letter
    }
  })
})
