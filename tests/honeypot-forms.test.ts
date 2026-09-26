import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

// Honeypot spam guard (2026-09-26): the seven pages that POST a lead to GHL
// each carry a hidden "website" trap field wired to isLikelyBot in their
// inline submit-handler script.
const pages = [
  'src/pages/noi-navigator.astro',
  'src/pages/refinance-readiness.astro',
  'src/pages/sale-readiness.astro',
  'src/pages/value-navigator.astro',
  'src/pages/get-started.astro',
  'src/pages/contact.astro',
  'src/pages/tools/noi-check.astro',
]

for (const path of pages) {
  const source = readFileSync(path, 'utf8')

  test(`${path} has a hidden honeypot input named "website"`, () => {
    expect(source).toMatch(
      /<input[^>]*name="website"[^>]*>/,
    )
    const [input] = source.match(/<input[^>]*name="website"[^>]*>/) ?? ['']
    expect(input).toContain('autocomplete="off"')
    expect(input).toContain('tabindex="-1"')
    expect(input).toContain('aria-hidden="true"')
  })

  test(`${path} submit handler imports and calls isLikelyBot`, () => {
    // tools/noi-check.astro sits one directory deeper than the other pages,
    // so its relative import climbs an extra level.
    const importPath = path === 'src/pages/tools/noi-check.astro' ? '../../lib/antispam' : '../lib/antispam'
    expect(source).toContain(`import { isLikelyBot } from '${importPath}'`)
    expect(source).toContain('isLikelyBot(')
  })
}

test('the honeypot-hiding class is defined once in the global stylesheet', () => {
  const tokens = readFileSync('src/styles/tokens.css', 'utf8')
  expect(tokens).toMatch(/\.hp-field\s*{/)
  expect(tokens).toContain('position: absolute')
  expect(tokens).toContain('width: 1px')
  expect(tokens).toContain('height: 1px')
  expect(tokens).toContain('overflow: hidden')
  expect(tokens).toMatch(/clip:\s*rect\(0[, ]*0[, ]*0[, ]*0\)/)
  expect(tokens).toContain('white-space: nowrap')
})

test('get-started.astro still routes by location on the bot path', () => {
  const source = readFileSync('src/pages/get-started.astro', 'utf8')
  const botBranch = source.slice(source.indexOf('isLikelyBot('), source.indexOf('isLikelyBot(') + 600)
  // routeByLocation runs once, before the honeypot check; the bot branch
  // below it must still use that route to pick local vs. referral, exactly
  // like the real lead path does.
  expect(source.indexOf('routeByLocation')).toBeLessThan(source.indexOf('isLikelyBot('))
  expect(botBranch).toContain("route === 'local'")
  expect(botBranch).toContain('localPanel.hidden = false')
  expect(botBranch).toContain('referralPanel.hidden = false')
})

test('tools/noi-check.astro still routes by GHL route on the bot path', () => {
  const source = readFileSync('src/pages/tools/noi-check.astro', 'utf8')
  const botBranch = source.slice(source.indexOf('isLikelyBot('), source.indexOf('isLikelyBot(') + 400)
  // buildLeadPayload runs once, before the honeypot check; the bot branch
  // below it must still use that payload's route to pick local vs.
  // advisory, exactly like the real lead path does, while skipping
  // submitLead entirely.
  expect(source.indexOf('buildLeadPayload(')).toBeLessThan(source.indexOf('isLikelyBot('))
  expect(source.indexOf('isLikelyBot(')).toBeLessThan(source.indexOf('await submitLead('))
  expect(botBranch).toContain("payload.route !== 'local'")
  expect(botBranch).toContain("payload.route !== 'advisory'")
  expect(botBranch).toContain('leadThankYou.hidden = false')
})
