import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import {
  WATCH_PILOT_SLUGS,
  watchPath,
  watchUrl,
  watchEmbedUrl,
  buildWatchVideoSchema,
  watchTitle,
  hasWatchPage,
} from '../src/lib/watch'

// Video watch page pilot (2026-11-18). Search Console reported all 26 videos
// as "Video isn't on a watch page" because the companion articles load the
// player only after a click, so the page HTML holds no player for Google to
// see. A watch page puts a real iframe in the first HTML response.

test('the pilot covers three to five videos and lists each slug once', () => {
  expect(WATCH_PILOT_SLUGS.length).toBeGreaterThanOrEqual(3)
  expect(WATCH_PILOT_SLUGS.length).toBeLessThanOrEqual(5)
  expect(new Set(WATCH_PILOT_SLUGS).size).toBe(WATCH_PILOT_SLUGS.length)
})

test('watch pages live under /watch/, never /video/ where the hero loops sit', () => {
  expect(watchPath('whats-my-apartment-building-worth')).toBe('/watch/whats-my-apartment-building-worth/')
  expect(watchUrl('abc')).toBe('https://apartmentwealthnavigator.com/watch/abc/')
})

test('the embed URL is a plain player with no autoplay and no cookie until play', () => {
  const url = new URL(watchEmbedUrl('R56WzR5-k5c'))
  expect(url.hostname).toBe('www.youtube-nocookie.com')
  expect(url.pathname).toBe('/embed/R56WzR5-k5c')
  expect(url.searchParams.get('autoplay')).toBeNull()
  expect(url.searchParams.get('rel')).toBe('0')
})

test('the video schema carries the fields Google needs and points at the watch page', () => {
  const s = buildWatchVideoSchema({
    title: 'T',
    description: 'D',
    uploadDate: '2026-10-01T00:00:00.000Z',
    youtubeId: 'R56WzR5-k5c',
    thumbnailUrl: 'https://x/t.jpg',
    pageUrl: 'https://apartmentwealthnavigator.com/watch/a/',
  })
  expect(s['@type']).toBe('VideoObject')
  expect(s.name).toBe('T')
  expect(s.embedUrl).toBe(watchEmbedUrl('R56WzR5-k5c'))
  expect(s.contentUrl).toBe('https://www.youtube.com/watch?v=R56WzR5-k5c')
  expect(s.thumbnailUrl).toEqual(['https://x/t.jpg'])
  expect(s.mainEntityOfPage).toEqual({ '@type': 'WebPage', '@id': 'https://apartmentwealthnavigator.com/watch/a/' })
})

test('every pilot slug is a published article that has a YouTube id', () => {
  for (const slug of WATCH_PILOT_SLUGS) {
    const found = ['universal', 'dc']
      .map((d) => {
        try {
          return readFileSync(`src/content/${d}/${slug}.md`, 'utf8')
        } catch {
          try {
            return readFileSync(`src/content/${d}/${slug}.mdx`, 'utf8')
          } catch {
            return ''
          }
        }
      })
      .find(Boolean)
    expect(found, `${slug} has no article file`).toBeTruthy()
    expect(found).toMatch(/^youtubeId: "[A-Za-z0-9_-]{11}"/m)
    expect(found).not.toMatch(/^draft: true/m)
  }
})

test('the watch page renders a real iframe up front, not the click-to-play facade', () => {
  const page = readFileSync('src/pages/watch/[slug].astro', 'utf8')
  expect(page).toContain('<iframe')
  expect(page).toContain('watchEmbedUrl(')
  expect(page).not.toContain('YouTubeFacade')
  expect(page).toContain('<JsonLd data={videoSchema} />')
  // Video leads the page: no cover image between the H1 and the player.
  expect(page.indexOf('<iframe')).toBeLessThan(page.indexOf('watch__body'))
  expect(page).toMatch(/canonical=\{watchUrl\(/)
})

test('the watch title adds "Video:" only when it fits in 60 characters', () => {
  expect(watchTitle('Fixed vs. Floating Apartment Loans')).toBe('Video: Fixed vs. Floating Apartment Loans')
  const long = 'x'.repeat(58)
  expect(watchTitle(long)).toBe(long)
  expect(hasWatchPage(WATCH_PILOT_SLUGS[0])).toBe(true)
  expect(hasWatchPage('not-a-pilot')).toBe(false)
})

test('the article links to its watch page only when one exists', () => {
  const layout = readFileSync('src/layouts/Article.astro', 'utf8')
  expect(layout).toContain('hasWatchPage(entry.id)')
  expect(layout).toContain('watchPath(entry.id)')
})
