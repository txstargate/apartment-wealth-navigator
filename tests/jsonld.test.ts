import { test, expect } from 'vitest'
import { buildArticleSchema } from '../src/lib/schema'

test('article schema includes required fields', () => {
  const s = buildArticleSchema({ title: 'T', description: 'D', url: 'https://x/y', author: 'Shafiq Hirani' })
  expect(s['@type']).toBe('Article')
  expect(s.author.name).toBe('Shafiq Hirani')
})
