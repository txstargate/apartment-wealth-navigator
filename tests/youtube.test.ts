import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { isYouTubeId, youtubeEmbedUrl, youtubeThumbnailUrl, youtubeWatchUrl, YOUTUBE_IFRAME_ALLOW } from '../src/lib/youtube'

// Companion-video embeds follow Greg's 2026-09-20 guidance: click-to-play
// facade (views count, no YouTube script until click), nocookie domain,
// rel=0, playsinline, no dead modestbranding, no covered chrome.

test('embed url uses the nocookie domain with rel=0 and playsinline, autoplay only on click', () => {
  expect(youtubeEmbedUrl('dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1&color=white')
  expect(youtubeEmbedUrl('dQw4w9WgXcQ', { autoplay: true })).toContain('autoplay=1')
  expect(youtubeEmbedUrl('dQw4w9WgXcQ')).not.toContain('modestbranding')
})

test('thumbnail and watch urls point at YouTube-hosted assets', () => {
  expect(youtubeThumbnailUrl('dQw4w9WgXcQ')).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
  expect(youtubeThumbnailUrl('dQw4w9WgXcQ', 'maxresdefault')).toContain('maxresdefault.jpg')
  expect(youtubeWatchUrl('dQw4w9WgXcQ')).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  expect(isYouTubeId('dQw4w9WgXcQ')).toBe(true)
  expect(isYouTubeId('not-an-id')).toBe(false)
})

test('the facade injects the player only on click and never hides YouTube chrome', () => {
  const facade = readFileSync('src/components/YouTubeFacade.astro', 'utf8')
  expect(facade).toContain("link.addEventListener('click'")
  expect(facade).toContain("document.createElement('iframe')")
  expect(facade).toContain("iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')")
  expect(facade).toContain("iframe.setAttribute('allowfullscreen', '')")
  expect(facade).not.toMatch(/<iframe/)
  // The poster is a real link to YouTube when JS is off.
  expect(facade).toMatch(/<a class="yt-facade__link" href=\{watch\}/)
  expect(YOUTUBE_IFRAME_ALLOW).toContain('picture-in-picture')
})

test('the article layout uses the facade and feeds the VideoObject a thumbnail', () => {
  const layout = readFileSync('src/layouts/Article.astro', 'utf8')
  expect(layout).toMatch(/<YouTubeFacade id=\{entry\.data\.youtubeId\} title=\{entry\.data\.title\} \/>/)
  expect(layout).toContain("thumbnailUrl: youtubeThumbnailUrl(entry.data.youtubeId, 'maxresdefault')")
  expect(layout).not.toContain('https://www.youtube.com/embed/')
})
