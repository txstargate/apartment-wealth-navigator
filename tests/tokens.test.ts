import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

test('tokens define the core palette', () => {
  const css = readFileSync('src/styles/tokens.css', 'utf8')
  expect(css).toContain('--color-bg: #FFFFFF')
  expect(css).toContain('--color-navy: #12314F')
  expect(css).toContain('--color-obsidian: #0A0D14')
  expect(css).toContain('--color-accent: #C5A880')
  expect(css).toContain('--color-champagne: #C5A880')
})
