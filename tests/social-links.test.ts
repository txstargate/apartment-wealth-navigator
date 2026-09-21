import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { SOCIAL_PROFILES, activeProfiles } from '../src/data/social'
import schema from '../src/data/person-professionalservice.json'

// Footer social icons (2026-09-20). Six slots, rendered only when a url is
// set, and every rendered url must also be in the Person sameAs so the
// footer and the identity graph agree.

test('six slots exist and only https urls render', () => {
  expect(SOCIAL_PROFILES.map((p) => p.id)).toEqual(['linkedin', 'youtube', 'x', 'facebook', 'instagram', 'tiktok'])
  const active = activeProfiles()
  expect(active.length).toBeGreaterThanOrEqual(2)
  for (const p of active) expect(p.url).toMatch(/^https:\/\//)
  expect(activeProfiles([{ id: 'x', label: 'X', url: '' }])).toEqual([])
})

test('every footer profile is declared in the Person sameAs', () => {
  const person = ((schema as any)['@graph'] as any[]).find((n) => n['@type'] === 'Person')
  for (const p of activeProfiles()) expect(person.sameAs).toContain(p.url)
})

test('footer renders the icons with spoken labels, rel=me, and no icon font', () => {
  const footer = readFileSync('src/components/Footer.astro', 'utf8')
  const links = readFileSync('src/components/SocialLinks.astro', 'utf8')
  expect(footer).toContain('<SocialLinks />')
  expect(links).toContain('rel="me noopener"')
  expect(links).toContain('aria-label={`Shafiq Hirani on ${p.label}`}')
  expect(links).not.toMatch(/font-awesome|fontawesome|cdn/i)
  for (const id of ['linkedin', 'youtube', 'x', 'facebook', 'instagram', 'tiktok']) expect(links).toMatch(new RegExp(`\\b${id}:`))
})
