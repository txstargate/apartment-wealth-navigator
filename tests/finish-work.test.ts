import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test, expect } from 'vitest'
import { referralIntakeUrl, REFERRAL_FALLBACK_MAILTO } from '../src/lib/referral'
import { serviceForPillar } from '../src/lib/pillar-service'

// Greg's review (2026-09-21): no live TODOs, no placeholder hrefs, no stub
// promises, and every article hands off to a service page.

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)],
  )
}

test('no TODO markers remain anywhere that renders or ships in source', () => {
  const files = walk('src').filter((f) => /\.(astro|md|mdx|ts)$/.test(f))
  const offenders = files.filter((f) => readFileSync(f, 'utf8').includes('TODO-Shafiq'))
  expect(offenders).toEqual([])
})

test('referral link falls back to a working mailto, never a placeholder', () => {
  expect(referralIntakeUrl(undefined)).toBe(REFERRAL_FALLBACK_MAILTO)
  expect(referralIntakeUrl('')).toBe(REFERRAL_FALLBACK_MAILTO)
  expect(referralIntakeUrl('TODO-Shafiq: referral intake URL')).toBe(REFERRAL_FALLBACK_MAILTO)
  expect(referralIntakeUrl('https://forms.example.com/referral')).toBe('https://forms.example.com/referral')
  expect(REFERRAL_FALLBACK_MAILTO.startsWith('mailto:shirani@enterprisere.com')).toBe(true)
  for (const page of ['src/pages/get-started.astro', 'src/pages/contact.astro']) {
    expect(readFileSync(page, 'utf8')).toContain('referralIntakeUrl(import.meta.env.PUBLIC_REFERRAL_INTAKE_URL)')
  }
})

test('every pillar hands off to a real service page', () => {
  for (const pillar of ['noi', 'refinance', 'sale', 'valuation']) {
    expect(serviceForPillar(pillar).href).toMatch(/^\/services\/(noi|refinance|sale)\/$/)
  }
  expect(serviceForPillar('unknown').href).toBe('/services/')
  expect(readFileSync('src/layouts/Article.astro', 'utf8')).toContain('class="article__service"')
})

test('service pages send the reader to the booking flow and the DMV hub has no stubs', () => {
  for (const f of ['noi', 'refinance', 'sale']) {
    expect(readFileSync(`src/content/services/${f}.md`, 'utf8')).toContain('[Request a building audit](/get-started/)')
  }
  const hub = readFileSync('src/pages/locations/index.astro', 'utf8')
  expect(hub).not.toContain('in progress')
  expect(hub).toContain('BR98379340')
  expect(readFileSync('src/pages/disclosures.astro', 'utf8')).toContain('dpor.virginia.gov/LicenseLookup')
})
