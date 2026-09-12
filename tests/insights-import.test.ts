import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { articleSchema } from '../src/content.config'

// The eight voice-gated articles from content/insights/, imported as
// draft: true on 2026-09-09 (build-plan.md Task 19 Step 3) and published
// after Shafiq's review pass on 2026-09-12 (tests/articles-published.test.ts).
const PAIRS: Array<{ universal: string; dc: string; pillar: 'valuation' | 'noi' | 'refinance' | 'sale' }> = [
  { universal: 'whats-my-apartment-building-worth', dc: 'dc-apartment-building-worth-2026', pillar: 'valuation' },
  { universal: 'how-to-increase-noi-small-apartment-building', dc: 'increase-noi-dc-apartment-building', pillar: 'noi' },
  { universal: 'how-to-refinance-small-apartment-building', dc: 'refinance-dc-apartment-building', pillar: 'refinance' },
  { universal: 'how-to-prepare-apartment-building-for-sale', dc: 'selling-dc-apartment-building-topa', pillar: 'sale' },
]

function readFrontmatter(path: string): Record<string, unknown> {
  const raw = readFileSync(path, 'utf8')
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  expect(match, `${path} should have frontmatter`).toBeTruthy()
  const lines = match![1].split('\n')
  const data: Record<string, string> = {}
  for (const line of lines) {
    const lineMatch = line.match(/^([a-zA-Z]+):\s*(.*)$/)
    if (lineMatch) {
      data[lineMatch[1]] = lineMatch[2].replace(/^"|"$/g, '')
    }
  }
  return data
}

for (const pair of PAIRS) {
  test(`${pair.pillar} pair: universal and dc entries validate and cross-link`, () => {
    const universalPath = `src/content/universal/${pair.universal}.mdx`
    const dcPath = `src/content/dc/${pair.dc}.mdx`

    const universalData = readFrontmatter(universalPath)
    const dcData = readFrontmatter(dcPath)

    expect(() =>
      articleSchema.parse({
        title: universalData.title,
        description: universalData.description,
        pillar: universalData.pillar,
        dcCounterpart: universalData.dcCounterpart,
        publishDate: universalData.publishDate,
        draft: universalData.draft === 'true',
      }),
    ).not.toThrow()

    expect(() =>
      articleSchema.parse({
        title: dcData.title,
        description: dcData.description,
        pillar: dcData.pillar,
        universalParent: dcData.universalParent,
        publishDate: dcData.publishDate,
        draft: dcData.draft === 'true',
      }),
    ).not.toThrow()

    expect(universalData.pillar).toBe(pair.pillar)
    expect(dcData.pillar).toBe(pair.pillar)
    expect(universalData.draft).toBe('false')
    expect(dcData.draft).toBe('false')
    expect(universalData.dcCounterpart).toBe(pair.dc)
    expect(dcData.universalParent).toBe(pair.universal)
  })
}
