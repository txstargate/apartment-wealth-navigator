import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { locationSchema } from '../src/content.config'
import { filterPublished } from '../src/lib/content'

const EXPECTED_SLUGS = [
  'washington-dc',
  'arlington-va',
  'alexandria-va',
  'montgomery-county-md',
  'prince-georges-county-md',
]

test('locationSchema accepts a valid draft stub', () => {
  expect(() =>
    locationSchema.parse({
      name: 'Washington, DC',
      slug: 'washington-dc',
      jurisdiction: 'District of Columbia',
      summary: 'A market read pending data.',
      draft: true,
    }),
  ).not.toThrow()
})

test('locationSchema rejects an entry missing a required field', () => {
  expect(() =>
    locationSchema.parse({
      name: 'Washington, DC',
      slug: 'washington-dc',
      draft: true,
    }),
  ).toThrow()
})

// 2026-10-10: Washington DC published (DC-first decision). The other four
// stay draft until each has its own market read.
const PUBLISHED_SLUGS = ['washington-dc']

test('all five location files exist and parse; only the published ones are live', () => {
  for (const slug of EXPECTED_SLUGS) {
    const raw = readFileSync(`src/content/locations/${slug}.mdx`, 'utf8')
    const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/)
    expect(frontmatterMatch, `${slug}.mdx should have frontmatter`).toBeTruthy()

    expect(raw).toContain(`slug: ${slug}`)
    expect(raw).toContain(PUBLISHED_SLUGS.includes(slug) ? 'draft: false' : 'draft: true')
  }
})

test('a published location page carries real data, a data date, and a CoStar source', () => {
  for (const slug of PUBLISHED_SLUGS) {
    const raw = readFileSync(`src/content/locations/${slug}.mdx`, 'utf8')
    expect(raw).toMatch(/^dataAsOf: \d{4}-\d{2}-\d{2}$/m)
    expect(raw).not.toMatch(/TODO-content|REPLACE_ME/)
    expect(raw).not.toMatch(/[—–]/)
    expect(raw).not.toMatch(/^# /m)
    expect(raw).toContain('*Sources: CoStar,')
    expect(raw).toContain('/value-navigator/')
  }
})

test('a draft location entry yields no static path', () => {
  const entries = EXPECTED_SLUGS.map((slug) => ({ id: slug, data: { draft: true } }))
  const paths = filterPublished(entries).map((entry) => ({ params: { slug: entry.id } }))
  expect(paths).toHaveLength(0)
})

test('the DMV hub gives each published location a labelled button, not just a clickable photo', () => {
  const hub = readFileSync('src/pages/locations/index.astro', 'utf8')
  expect(hub).toContain('class="dmv-block__button"')
  expect(hub).toContain('market data')
  expect(hub).toContain('class="dmv-tile__cue"')
})
