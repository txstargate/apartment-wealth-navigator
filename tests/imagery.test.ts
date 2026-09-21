import { existsSync, readFileSync, statSync } from 'node:fs'
import { test, expect } from 'vitest'

// Design pass 2026-09-17: the homepage hero and the five location headers
// come from Friday's image-ideation pipeline (and one Firefly image for DC),
// placed through Astro's <Image> so every page gets responsive sizes.

test('homepage renders the hero photograph through astro:assets with responsive widths', () => {
  const index = readFileSync('src/pages/index.astro', 'utf8')
  expect(index).toMatch(/import \{ Image(, getImage)? \} from 'astro:assets'/)
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

test('every service page declares a header image that exists on disk', () => {
  for (const slug of ['noi', 'refinance', 'sale']) {
    const fm = readFileSync(`src/content/services/${slug}.md`, 'utf8').split('\n---\n')[0]
    expect(fm).toContain(`headerImage: ../../assets/services/${slug}.jpg`)
    expect(fm).toMatch(/headerAlt: ".{20,}"/)
    expect(existsSync(`src/assets/services/${slug}.jpg`)).toBe(true)
  }
  const page = readFileSync('src/pages/services/[service].astro', 'utf8')
  expect(page).toMatch(/entry\.data\.headerImage && \([\s\S]*<Image[\s\S]*src=\{entry\.data\.headerImage\}/)
  const config = readFileSync('src/content.config.ts', 'utf8')
  expect(config).toMatch(/serviceSchema\.extend\(\{[\s\S]*headerImage: image\(\)\.optional\(\)/)
})

test('about page renders the header, the portrait, and the compass figure through astro:assets', () => {
  const about = readFileSync('src/pages/about.astro', 'utf8')
  expect(about).toContain("import aboutHeader from '../assets/about-header.jpg'")
  expect(about).toMatch(/<Image[\s\S]*class="about__header-image"[\s\S]*src=\{aboutHeader\}/)
  expect(about).toMatch(/<Image[\s\S]*class="about__portrait"[\s\S]*src=\{portrait\}/)
  expect(existsSync('src/assets/about-header.jpg')).toBe(true)
  expect(existsSync('src/assets/shafiq/portrait-cream.jpg')).toBe(true)
})

test("Shafiq's portraits are placed (2026-09-18) and the schema headshot is no longer a placeholder", () => {
  expect(existsSync('src/assets/shafiq/portrait-navy.jpg')).toBe(true)
  expect(existsSync('src/assets/shafiq/contact-portrait.jpg')).toBe(true)
  expect(readFileSync('src/pages/contact.astro', 'utf8')).toMatch(/<Image[\s\S]*class="contact__portrait"/)
  expect(readFileSync('src/pages/index.astro', 'utf8')).toMatch(/<Image[\s\S]*class="who__portrait"[\s\S]*src=\{portraitNavy\}/)
  const schema = readFileSync('src/data/person-professionalservice.json', 'utf8')
  expect(schema).not.toContain('_todo_headshot')
  expect(schema).toContain('https://apartmentwealthnavigator.com/shafiq-hirani.jpg')
  expect(statSync('public/shafiq-hirani.jpg').size).toBeGreaterThan(50_000)
  expect(existsSync('public/TODO-shafiq-headshot.md')).toBe(false)
})

test('homepage hero plays a crossfading playlist of all six loops, hero first, phones included', () => {
  const index = readFileSync('src/pages/index.astro', 'utf8')
  expect(index).toMatch(/const heroPlaylist = \[\s*\{ src: '\/video\/awn-hero-loop\.mp4', mobile: '\/video\/mobile\/awn-hero-loop\.mp4' \}/)
  for (const slug of ['washington-dc', 'arlington-va', 'alexandria-va', 'montgomery-county-md', 'prince-georges-county-md']) {
    expect(index).toContain(`{ src: '/video/locations/${slug}.mp4', mobile: '/video/mobile/${slug}.mp4' }`)
    expect(existsSync(`public/video/mobile/${slug}.mp4`)).toBe(true)
  }
  expect(index).toMatch(/<div[\s\S]*class="hero__stage"[\s\S]*data-playlist=\{JSON\.stringify\(heroPlaylist\)\}/)
  expect((index.match(/<video class="hero__video" muted playsinline preload="none"/g) ?? []).length).toBe(2)
  expect(index).toContain("import { attachLoopVideos } from '../lib/loop-video'")
  // Only reduced motion hides the stage; phones play the mobile files.
  expect(index).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.hero__stage \{\s*display: none;/)
  expect(index).not.toMatch(/max-width: 640px\)[^}]*\.hero__stage/)
  expect(existsSync('public/video/awn-hero-loop.mp4')).toBe(true)
  expect(existsSync('public/video/mobile/awn-hero-loop.mp4')).toBe(true)
})

test('every published article has a cover that exists, and the layout renders it as the share image', () => {
  const covered = [
    'universal/whats-my-apartment-building-worth',
    'universal/how-to-increase-noi-small-apartment-building',
    'universal/how-to-refinance-small-apartment-building',
    'universal/how-to-prepare-apartment-building-for-sale',
    'dc/dc-apartment-building-worth-2026',
    'dc/increase-noi-dc-apartment-building',
    'dc/refinance-dc-apartment-building',
    'dc/selling-dc-apartment-building-topa',
  ]
  for (const path of covered) {
    const slug = path.split('/')[1]
    const fm = readFileSync(`src/content/${path}.mdx`, 'utf8').split('\n---\n')[0]
    expect(fm).toContain(`coverImage: ../../assets/covers/${slug}.jpg`)
    expect(fm).toMatch(/coverAlt: ".{20,}"/)
    expect(existsSync(`src/assets/covers/${slug}.jpg`)).toBe(true)
  }
  const layout = readFileSync('src/layouts/Article.astro', 'utf8')
  expect(layout).toMatch(/entry\.data\.coverImage && \([\s\S]*<Image[\s\S]*class="article__cover"/)
  expect(layout).toContain('ogImage={ogCover?.src}')
  const base = readFileSync('src/layouts/Base.astro', 'utf8')
  expect(base).toContain('<meta property="og:image" content={ogImageUrl} />')
})

test('homepage service tiles and the DMV hub tiles carry the header photographs', () => {
  const index = readFileSync('src/pages/index.astro', 'utf8')
  expect(index).toMatch(/serviceTiles\.map\(\(tile\) => \([\s\S]*<a class="service-tile" href=\{tile\.href\}>[\s\S]*<Image[\s\S]*src=\{tile\.image\}/)
  const hub = readFileSync('src/pages/locations/index.astro', 'utf8')
  // Hub rebuilt 2026-09-21: tiles keep the header photographs, link only when published, promise nothing.
  expect(hub).toMatch(/<Tag class="dmv-tile" href=\{published \? `\/locations\/\$\{id\}` : undefined\}>/)
  expect(hub).toContain('src={entry.data.headerImage}')
  expect(hub).not.toContain('in progress')
  const service = readFileSync('src/pages/services/[service].astro', 'utf8')
  expect(service).toMatch(/entry\.data\.bodyImage && \([\s\S]*<figure class="service__figure">/)
  for (const slug of ['noi', 'refinance', 'sale']) {
    expect(existsSync(`src/assets/services/body/${slug}.jpg`)).toBe(true)
    expect(readFileSync(`src/content/services/${slug}.md`, 'utf8')).toContain(`bodyImage: ../../assets/services/body/${slug}.jpg`)
  }
})

test('location pages with a finished loop declare it and the file exists', () => {
  for (const slug of ['washington-dc', 'arlington-va', 'alexandria-va', 'montgomery-county-md', 'prince-georges-county-md']) {
    const fm = readFileSync(`src/content/locations/${slug}.mdx`, 'utf8').split('\n---\n')[0]
    expect(fm).toContain(`headerVideo: /video/locations/${slug}.mp4`)
    expect(existsSync(`public/video/locations/${slug}.mp4`)).toBe(true)
  }
  const page = readFileSync('src/pages/locations/[slug].astro', 'utf8')
  expect(page).toMatch(/entry\.data\.headerVideo && \([\s\S]*<video[\s\S]*data-src=\{entry\.data\.headerVideo\}/)
  expect(page).toContain("import { attachLoopVideos } from '../../lib/loop-video'")
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
