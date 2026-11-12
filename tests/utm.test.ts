import { test, expect } from 'vitest'
import { parseUtm, captureUtm, readUtm, UTM_STORAGE_KEY } from '../src/lib/utm'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  }
}

test('parseUtm keeps the four UTM keys and ignores everything else', () => {
  expect(parseUtm('?utm_source=linkedin&utm_medium=organic_social&utm_campaign=noi_test&utm_content=leaks&foo=bar')).toEqual({
    utm_source: 'linkedin',
    utm_medium: 'organic_social',
    utm_campaign: 'noi_test',
    utm_content: 'leaks',
  })
})

test('parseUtm lowercases and strips characters outside the safe set', () => {
  const out = parseUtm('?utm_source=LinkedIn&utm_campaign=jane%40example.com%20x')
  expect(out.utm_source).toBe('linkedin')
  expect(out.utm_campaign).toBe('janeexample.comx')
})

test('parseUtm returns nothing when no UTM is present', () => {
  expect(parseUtm('?ref=abc')).toEqual({})
})

test('captureUtm stores the first touch and does not overwrite it', () => {
  const s = memoryStorage()
  captureUtm('?utm_source=youtube&utm_medium=organic_video', s)
  captureUtm('?utm_source=linkedin&utm_medium=organic_social', s)
  expect(readUtm(s)).toEqual({ utm_source: 'youtube', utm_medium: 'organic_video' })
})

test('captureUtm stores nothing for an untagged visit', () => {
  const s = memoryStorage()
  captureUtm('', s)
  expect(s.getItem(UTM_STORAGE_KEY)).toBeNull()
})

test('readUtm survives corrupt storage', () => {
  const s = { getItem: () => '{not json' }
  expect(readUtm(s)).toEqual({})
})
