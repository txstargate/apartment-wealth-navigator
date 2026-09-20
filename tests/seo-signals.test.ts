import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { buildLlmsTxt } from '../src/lib/llms'
import { lastmodFor } from '../src/lib/sitemap-lastmod'
import schema from '../src/data/person-professionalservice.json'

// SEO and AEO signals added 2026-09-20: identity graph on the homepage with
// profile links, an llms.txt built from the collections, and truthful
// sitemap lastmod dates.

test('identity graph links the same entity across profiles and names the website', () => {
  const graph = (schema as any)['@graph'] as any[]
  const person = graph.find((n) => n['@type'] === 'Person')
  const org = graph.find((n) => String(n['@id']).endsWith('#organization'))
  const site = graph.find((n) => n['@type'] === 'WebSite')
  expect(person.sameAs).toEqual(expect.arrayContaining([
    'https://www.linkedin.com/in/shafiqhirani/',
    'https://www.youtube.com/@ShafiqHiraniCRE',
  ]))
  expect(person.sameAs.length).toBeGreaterThanOrEqual(4)
  expect(org.logo).toMatch(/^https:\/\/apartmentwealthnavigator\.com\//)
  expect(org.parentOrganization.name).toBe('RE/MAX Distinctive Commercial')
  expect(site.publisher['@id']).toBe(org['@id'])
  // The homepage emits the graph; About keeps it too.
  expect(readFileSync('src/pages/index.astro', 'utf8')).toContain('<JsonLd data={siteSchema} />')
  expect(readFileSync('src/pages/about.astro', 'utf8')).toContain('<JsonLd data={personSchema} />')
})

test('llms.txt lists every published article with its description and never a draft', () => {
  const txt = buildLlmsTxt({
    universal: [{ slug: 'a', title: 'Guide A', description: 'Desc A.' }],
    dc: [{ slug: 'dc-a', title: 'DC A', description: 'Desc DC.' }],
    services: [{ slug: 'noi', title: 'NOI', description: 'Read.' }],
    locations: [],
  })
  expect(txt.startsWith('# Apartment Wealth Navigator')).toBe(true)
  expect(txt).toContain('- [Guide A](https://apartmentwealthnavigator.com/insights/a/): Desc A.')
  expect(txt).toContain('- [DC A](https://apartmentwealthnavigator.com/insights/dc-a/): Desc DC.')
  expect(txt).toContain('- [NOI](https://apartmentwealthnavigator.com/services/noi/): Read.')
  expect(txt).not.toContain('## Markets')
  expect(txt).toContain('/tools/noi-check/')
  expect(txt).not.toContain('—')
  const endpoint = readFileSync('src/pages/llms.txt.ts', 'utf8')
  expect(endpoint).toContain('filterPublished')
})

test('sitemap lastmod comes from publishDate for articles and git for pages, else nothing', () => {
  const sources = { articleDates: { dscr: '2026-09-20' }, pageDates: { '/': '2026-09-19', '/tools': '2026-09-18' } }
  expect(lastmodFor('https://apartmentwealthnavigator.com/insights/dscr/', sources)).toBe('2026-09-20')
  expect(lastmodFor('https://apartmentwealthnavigator.com/', sources)).toBe('2026-09-19')
  expect(lastmodFor('https://apartmentwealthnavigator.com/tools/', sources)).toBe('2026-09-18')
  expect(lastmodFor('https://apartmentwealthnavigator.com/insights/unknown/', sources)).toBeUndefined()
  expect(lastmodFor('https://apartmentwealthnavigator.com/dmv/washington-dc/', sources)).toBeUndefined()
})
