import { existsSync, readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

// Design pass 2026-09-17: the homepage hero and the five location headers
// come from Friday's image-ideation pipeline (and one Firefly image for DC),
// placed through Astro's <Image> so every page gets responsive sizes.

test('homepage renders the hero photograph through astro:assets with responsive widths', () => {
  const index = readFileSync('src/pages/index.astro', 'utf8')
  expect(index).toContain("import { Image } from 'astro:assets'")
  expect(index).toContain("import heroImage from '../assets/hero-dc-rowhouses.jpg'")
  expect(index).toMatch(/<Image[\s\S]*class="hero__image"[\s\S]*src=\{heroImage\}[\s\S]*widths=\{\[640, 1024, 1600, 1920\]\}/)
  expect(index).toContain('loading="eager"')
  expect(existsSync('src/assets/hero-dc-rowhouses.jpg')).toBe(true)
})

test('hero alt text stays generic, never naming a block', () => {
  const index = readFileSync('src/pages/index.astro', 'utf8')
  const alt = index.match(/alt="([^"]+)"/)?.[1] ?? ''
  expect(alt.length).toBeGreaterThan(20)
  for (const named of ['Capitol Hill', 'Petworth', 'Columbia Heights', 'Dupont', 'Anacostia']) {
    expect(alt).not.toContain(named)
  }
})

test('every location page declares a header image that exists on disk', () => {
  const slugs = ['washington-dc', 'arlington-va', 'alexandria-va', 'montgomery-county-md', 'prince-georges-county-md']
  for (const slug of slugs) {
    const fm = readFileSync(`src/content/locations/${slug}.mdx`, 'utf8').split('\n---\n')[0]
    expect(fm).toContain(`headerImage: ../../assets/locations/${slug}.jpg`)
    expect(fm).toMatch(/headerAlt: ".{20,}"/)
    expect(existsSync(`src/assets/locations/${slug}.jpg`)).toBe(true)
  }
})

test('location template renders the header image above the article', () => {
  const page = readFileSync('src/pages/locations/[slug].astro', 'utf8')
  expect(page).toContain("import { Image } from 'astro:assets'")
  expect(page).toMatch(/entry\.data\.headerImage && \([\s\S]*<Image[\s\S]*src=\{entry\.data\.headerImage\}/)
  expect(page).toContain('object-fit: cover')
  const config = readFileSync('src/content.config.ts', 'utf8')
  expect(config).toContain('headerImage: image().optional()')
  expect(config).toContain('schema: locationSchemaWithImage')
})
