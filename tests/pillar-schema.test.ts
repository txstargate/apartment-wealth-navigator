import { test, expect } from 'vitest'
import { articleSchema } from '../src/content.config'

test('pillar enum accepts all four pillars', () => {
  for (const pillar of ['valuation', 'noi', 'refinance', 'sale']) {
    expect(() =>
      articleSchema.parse({
        title: 'T',
        description: 'D',
        pillar,
        publishDate: '2026-09-08',
        draft: true,
      }),
    ).not.toThrow()
  }
})

test('pillar enum rejects an unknown pillar', () => {
  expect(() =>
    articleSchema.parse({
      title: 'T',
      description: 'D',
      pillar: 'bogus',
      publishDate: '2026-09-08',
      draft: true,
    }),
  ).toThrow()
})
