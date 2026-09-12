import { test, expect } from 'vitest'
import { filterPublished } from '../src/lib/content'

test('filterPublished keeps entries where draft is false', () => {
  const entries = [
    { id: 'live-article', data: { draft: false } },
    { id: 'draft-article', data: { draft: true } },
  ]

  expect(filterPublished(entries).map((entry) => entry.id)).toEqual(['live-article'])
})

test('a draft entry yields no static path', () => {
  const entries = [{ id: 'todo-content-placeholder', data: { draft: true } }]

  const paths = filterPublished(entries).map((entry) => ({ params: { slug: entry.id } }))

  expect(paths).toHaveLength(0)
})
