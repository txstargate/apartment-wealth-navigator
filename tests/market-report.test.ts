import { readFileSync, existsSync } from 'node:fs'
import { test, expect } from 'vitest'
import { reportSchema } from '../src/content.config'
import { orderReports } from '../src/lib/reports'
import { buildLlmsTxt } from '../src/lib/llms'

// Monthly DMV market report (added 2026-10-10). One file per month in
// src/content/reports/, newest first on /market-report/. Rotation per the
// series plan: DC, then Northern Virginia, then Suburban Maryland.

const FIRST = 'src/content/reports/2026-09-dc.mdx'

test('reportSchema requires market, month, data date and description', () => {
  const ok = {
    title: 'Washington DC Multifamily Market Report, September 2026',
    market: 'Washington DC',
    month: '2026-09',
    dataAsOf: '2026-09-08',
    publishDate: '2026-10-10',
    description: 'x',
  }
  expect(() => reportSchema.parse(ok)).not.toThrow()
  expect(() => reportSchema.parse({ ...ok, month: 'September' })).toThrow()
  expect(() => reportSchema.parse({ ...ok, market: 'Baltimore' })).toThrow()
})

test('reports list newest month first and drop drafts', () => {
  const entries = [
    { id: 'a', data: { month: '2026-09', draft: false } },
    { id: 'b', data: { month: '2026-11', draft: false } },
    { id: 'c', data: { month: '2026-12', draft: true } },
    { id: 'd', data: { month: '2026-10' } },
  ]
  expect(orderReports(entries).map((e) => e.id)).toEqual(['b', 'd', 'a'])
})

test('the September DC report is published with sources and no stale email wording', () => {
  const raw = readFileSync(FIRST, 'utf8')
  expect(raw).toContain('month: 2026-09')
  expect(raw).toContain('draft: false')
  expect(raw).toContain('ref 6297068')
  expect(raw).toContain('remax-intel')
  expect(raw).toContain('$191,894')
  expect(raw).not.toMatch(/[—–]/)
  expect(raw).not.toMatch(/^# /m)
  expect(raw).not.toContain('Reply to the email')
})

test('the report is reachable from the footer, the DMV hub and the DC page', () => {
  expect(readFileSync('src/components/Footer.astro', 'utf8')).toContain('href="/market-report/"')
  expect(readFileSync('src/pages/locations/index.astro', 'utf8')).toContain('href="/market-report/"')
  expect(readFileSync('src/content/locations/washington-dc.mdx', 'utf8')).toContain('/market-report/')
})

test('the old WordPress /market-reports/ path now lands on the report hub', () => {
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'))
  const r = vercel.redirects.find((x: { source: string }) => x.source === '/market-reports/')
  expect(r.destination).toBe('/market-report/')
  expect(readFileSync('docs/redirects.csv', 'utf8')).toMatch(/^\/market-reports\/,\/market-report\//m)
})

test('llms.txt lists the market reports', () => {
  const txt = buildLlmsTxt({
    universal: [], dc: [], services: [], locations: [],
    reports: [{ slug: '2026-09-dc', title: 'Washington DC Multifamily Market Report, September 2026', description: 'd' }],
  })
  expect(txt).toContain('## Market reports')
  expect(txt).toContain('https://apartmentwealthnavigator.com/market-report/2026-09-dc/')
})

test('the built hub and report pages exist (run npm run build first)', () => {
  expect(existsSync('dist/market-report/index.html')).toBe(true)
  expect(existsSync('dist/market-report/2026-09-dc/index.html')).toBe(true)
})
