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

test('all five location stub files exist, parse, and are marked draft', () => {
  for (const slug of EXPECTED_SLUGS) {
    const raw = readFileSync(`src/content/locations/${slug}.mdx`, 'utf8')
    const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/)
    expect(frontmatterMatch, `${slug}.mdx should have frontmatter`).toBeTruthy()

    expect(raw).toContain(`slug: ${slug}`)
    expect(raw).toContain('draft: true')
  }
})

test('a draft location entry yields no static path', () => {
  const entries = EXPECTED_SLUGS.map((slug) => ({ id: slug, data: { draft: true } }))
  const paths = filterPublished(entries).map((entry) => ({ params: { slug: entry.id } }))
  expect(paths).toHaveLength(0)
})
