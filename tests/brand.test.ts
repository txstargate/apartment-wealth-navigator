import { readFileSync, existsSync } from 'node:fs'
import { test, expect } from 'vitest'

test('header inlines the compass mark svg beside the wordmark, linking home', () => {
  const header = readFileSync('src/components/Header.astro', 'utf8')
  expect(header).toContain('Apartment Wealth Navigator compass mark')
  expect(header).toContain('Apartment Wealth Navigator')
  expect(header).toMatch(/<a class="site-nav__brand" href="\/">[\s\S]*<svg/)
})

test('header inlines the Wayfarer compass mark (broken ring + champagne arrow)', () => {
  const header = readFileSync('src/components/Header.astro', 'utf8')
  expect(header).toContain('52,12 26,20 36,30')
})

test('favicon asset is copied into public/ and referenced from Base head', () => {
  expect(existsSync('public/awn-favicon.svg')).toBe(true)
  const base = readFileSync('src/layouts/Base.astro', 'utf8')
  expect(base).toContain('<link rel="icon" type="image/svg+xml" href="/awn-favicon.svg">')
})

test('favicon uses the updated Wayfarer arrow points', () => {
  const favicon = readFileSync('public/awn-favicon.svg', 'utf8')
  expect(favicon).toContain('48,15 26,22 35,30')
})

test('footer carries the tracked champagne motto line', () => {
  const footer = readFileSync('src/components/Footer.astro', 'utf8')
  expect(footer).toContain('Insula · Reditus · Exitus')
})

test('about page carries the origin story line from the brand spec', () => {
  const about = readFileSync('src/pages/about.astro', 'utf8')
  expect(about).toContain('Insula, the Roman apartment block')
  expect(about).toContain("Reditus, its return")
  expect(about).toContain("Exitus, the owner's exit")
})

test('tokens.css defines the full locked palette', () => {
  const css = readFileSync('src/styles/tokens.css', 'utf8')
  expect(css).toContain('#0A0D14') // obsidian
  expect(css).toContain('#0F172A') // ink
  expect(css).toContain('#C5A880') // champagne
  expect(css).toContain('#A98C63') // champagne deep
  expect(css).toContain('#F1EDE6') // cream
})
