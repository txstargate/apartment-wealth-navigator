import { existsSync, readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

const md = readFileSync('src/content/services/value.md', 'utf8')

test('value service has the Navigator title, tagline, and the appraisal and fee guardrails', () => {
  expect(md).toContain('title: Value Navigator™\n')
  expect(md).toContain('tagline: "Broker opinions of value and property evaluation"\n')
  expect(existsSync('src/assets/services/body/value-range.png')).toBe(true)
  expect(md).toContain('not an appraisal')
  expect(md).toContain('The first call is free. Any engagement after it is scoped and quoted in writing before work starts.')
  expect(md).not.toContain('—')
  expect(md).not.toMatch(/\$\d/)
  expect(md).not.toMatch(/turnaround|business days|within \d/i)
})

test('free tool and service link both ways, and the schema, index and homepage know the fifth pillar', () => {
  expect(md).toContain('](/value-navigator/)')
  expect(readFileSync('src/pages/value-navigator.astro', 'utf8')).toContain('href="/services/value/"')
  expect(readFileSync('src/content.config.ts', 'utf8')).toContain("'buy', 'value'")
  expect(readFileSync('src/pages/services/index.astro', 'utf8')).toContain("'buy', 'value'")
  const home = readFileSync('src/pages/index.astro', 'utf8')
  expect(home).toContain('Five ways I work with apartment owners and buyers')
  expect(home).not.toContain('Three ways I work')
  for (const href of ['/services/noi', '/services/sale', '/services/refinance', '/services/buy', '/services/value']) {
    expect(home).toContain(`href: '${href}'`)
  }
})
