import { test, expect } from 'vitest'
import { buildArticleSchema } from '../src/lib/schema'

test('article schema includes required fields', () => {
  const s = buildArticleSchema({ title: 'T', description: 'D', url: 'https://x/y', author: 'Shafiq Hirani' })
  expect(s['@type']).toBe('Article')
  expect(s.author.name).toBe('Shafiq Hirani')
})

test('article schema links the author to the site Person id and carries image and dateModified', () => {
  const s = buildArticleSchema({
    title: 'T', description: 'D', url: 'https://x/y', author: 'Shafiq Hirani',
    datePublished: '2026-01-01T00:00:00.000Z', dateModified: '2026-02-01T00:00:00.000Z', image: 'https://x/i.jpg',
  })
  expect(s.author['@id']).toBe('https://apartmentwealthnavigator.com/#person')
  expect(s.dateModified).toBe('2026-02-01T00:00:00.000Z')
  expect(s.image).toEqual(['https://x/i.jpg'])
  expect(s.publisher).toEqual({ '@id': 'https://apartmentwealthnavigator.com/#person' })
})
