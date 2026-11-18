import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { buildReportSignupPayload, resolveReportWebhookUrl, isBuildingSize } from '../src/lib/reportSignup'

test('payload carries the report tool name and a size tag', () => {
  const p = buildReportSignupPayload({ firstName: ' Ana ', email: ' a@b.co ', buildingSize: '5-20', sourcePage: '/market-report/2026-11-dc/' })
  expect(p).toMatchObject({ first_name: 'Ana', email: 'a@b.co', building_size: '5-20', tool_name: 'Navigator Report' })
  expect(p.tags).toEqual(['navigator-report', 'navigator-report-5-20'])
})

test('an unknown building size is rejected', () => {
  expect(isBuildingSize('1-2')).toBe(false)
  expect(() => buildReportSignupPayload({ firstName: 'A', email: 'a@b.co', buildingSize: '1-2', sourcePage: '/' })).toThrow()
})

test('the signup stays hidden unless its own webhook is set', () => {
  expect(resolveReportWebhookUrl(undefined)).toBeNull()
  expect(resolveReportWebhookUrl('')).toBeNull()
  expect(resolveReportWebhookUrl('off')).toBeNull()
  expect(resolveReportWebhookUrl('https://example.com/hook')).toBe('https://example.com/hook')
})

test('the report signup never uses the NOI intake webhook', () => {
  const lib = readFileSync('src/lib/reportSignup.ts', 'utf8')
  const comp = readFileSync('src/components/ReportSignup.astro', 'utf8')
  expect(lib).not.toContain('DEFAULT_GHL_WEBHOOK_URL')
  expect(lib).not.toContain('7665ce69')
  expect(comp).toContain('PUBLIC_GHL_REPORT_WEBHOOK_URL')
})

test('the signup has a honeypot and sits on the report page', () => {
  const comp = readFileSync('src/components/ReportSignup.astro', 'utf8')
  expect(comp).toMatch(/<input[^>]*name="website"[^>]*tabindex="-1"[^>]*aria-hidden="true"/)
  expect(comp).toContain('isLikelyBot(')
  expect(readFileSync('src/pages/market-report/[slug].astro', 'utf8')).toContain('<ReportSignup')
})

test('the November report carries the Navigator Report name and no em dashes', () => {
  const raw = readFileSync('src/content/reports/2026-11-dc.mdx', 'utf8')
  expect(raw).toContain('title: "The Navigator Report: DC Small Buildings, November 2026"')
  expect(raw).not.toMatch(/[—–]/)
  const seo = raw.match(/seoTitle: "(.*)"/)![1]
  expect(seo.length).toBeLessThanOrEqual(60)
})
