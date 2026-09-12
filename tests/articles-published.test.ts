import { readFileSync, readdirSync } from 'node:fs'
import { test, expect } from 'vitest'

// Review pass 2026-09-12: the eight pillar articles (four universal, four DC
// branches) went from draft to published. Each carries FAQ frontmatter that
// mirrors its body FAQ (FAQPage JSON-LD), sets inlineCtas so the layout does
// not double the crosslink and CTA, and has no body-level H1 (the layout
// renders the title). DC branches attribute their figures to CoStar.

const PUBLISHED = {
  universal: [
    'whats-my-apartment-building-worth',
    'how-to-increase-noi-small-apartment-building',
    'how-to-refinance-small-apartment-building',
    'how-to-prepare-apartment-building-for-sale',
  ],
  dc: [
    'dc-apartment-building-worth-2026',
    'increase-noi-dc-apartment-building',
    'refinance-dc-apartment-building',
    'selling-dc-apartment-building-topa',
  ],
}

function frontmatter(path: string): string {
  return readFileSync(path, 'utf8').split('\n---\n')[0]
}

function body(path: string): string {
  return readFileSync(path, 'utf8').split('\n---\n').slice(1).join('\n---\n')
}

for (const [collection, slugs] of Object.entries(PUBLISHED)) {
  for (const slug of slugs) {
    const path = `src/content/${collection}/${slug}.mdx`

    test(`${collection}/${slug} is published with FAQ schema and inline CTAs`, () => {
      const fm = frontmatter(path)
      expect(fm).toContain('draft: false')
      expect(fm).toContain('inlineCtas: true')
      expect((fm.match(/- question: /g) ?? []).length).toBeGreaterThanOrEqual(3)
    })

    test(`${collection}/${slug} has no body H1, em dash, or placeholder`, () => {
      const text = body(path)
      expect(text).not.toMatch(/^# /m)
      expect(text).not.toMatch(/[—–]/)
      expect(text).not.toMatch(/REPLACE_ME|TODO-content/)
    })
  }
}

test('DC branches attribute their sales figures to CoStar with permission', () => {
  for (const slug of PUBLISHED.dc) {
    const text = body(`src/content/dc/${slug}.mdx`)
    expect(text).toContain('*Source: CoStar,')
    expect(text).toContain('Market data © CoStar, used with permission.')
  }
})

test('the two stub articles stay draft', () => {
  const stubs = [
    'src/content/universal/how-to-tell-if-your-apartment-building-is-underperforming.mdx',
    'src/content/dc/how-to-increase-noi-on-a-dc-class-b-building-in-a-high-vacancy-market.mdx',
  ]
  for (const path of stubs) expect(frontmatter(path)).toContain('draft: true')
})

test('article layout emits FAQPage schema and honors inlineCtas', () => {
  const layout = readFileSync('src/layouts/Article.astro', 'utf8')
  expect(layout).toContain('buildFaqSchema(entry.data.faq)')
  expect(layout).toContain('{faqSchema && <JsonLd data={faqSchema} />}')
  expect(layout).toContain('{!inlineCtas && <GeoCTA />}')
  expect(layout).toContain("!inlineCtas && counterpart && direction === 'down'")
  expect(layout).toContain("!inlineCtas && counterpart && direction === 'up'")
})

test('every content file in the two collections is either published or an explicit draft', () => {
  for (const collection of ['universal', 'dc']) {
    for (const file of readdirSync(`src/content/${collection}`)) {
      expect(frontmatter(`src/content/${collection}/${file}`)).toMatch(/draft: (true|false)/)
    }
  }
})
