import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { isYouTubeId, youtubeEmbedUrl, youtubeThumbnailUrl, youtubeWatchUrl, YOUTUBE_IFRAME_ALLOW } from '../src/lib/youtube'

// Companion-video embeds follow Greg's 2026-09-20 guidance: click-to-play
// facade (views count, no YouTube script until click), nocookie domain,
// rel=0, playsinline, no dead modestbranding, no covered chrome.

test('embed url uses the nocookie domain with rel=0 and playsinline, autoplay only on click', () => {
  expect(youtubeEmbedUrl('dQw4w9WgXcQ')).toBe(
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1&color=white&cc_load_policy=0&enablejsapi=1&origin=https%3A%2F%2Fapartmentwealthnavigator.com'
  )
  expect(youtubeEmbedUrl('dQw4w9WgXcQ', { autoplay: true })).toContain('autoplay=1')
  expect(youtubeEmbedUrl('dQw4w9WgXcQ')).not.toContain('modestbranding')
})

test('embed url carries enablejsapi and origin so the facade can drive the IFrame Player API', () => {
  const url = new URL(youtubeEmbedUrl('dQw4w9WgXcQ'))
  expect(url.searchParams.get('enablejsapi')).toBe('1')
  expect(url.searchParams.get('origin')).toBe('https://apartmentwealthnavigator.com')
  expect(url.searchParams.get('cc_load_policy')).toBe('0')
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

test('the facade loads the IFrame Player API only on click and disables captions on ready and on play', () => {
  const facade = readFileSync('src/components/YouTubeFacade.astro', 'utf8')

  // The API script must not be present as a static <script src> tag outside
  // the click handler — it can only be injected after the click fires.
  expect(facade).not.toMatch(/<script[^>]*src=["']https:\/\/www\.youtube\.com\/iframe_api["']/)

  // Caption disabling must happen in both the onReady handler and the
  // PLAYING state-change handler, since a track can load after ready.
  expect(facade).toContain('onReady')
  expect(facade).toContain('onStateChange')
  expect(facade).toContain('YT.PlayerState.PLAYING')
  expect(facade).toContain("unloadModule('captions')")
  expect(facade).toContain("unloadModule('cc')")
  expect(facade).toContain("setOption('captions', 'track', {})")

  // Every caption-disable call must be guarded so a failed module name
  // never throws and breaks playback.
  expect(facade).toContain('try')
  expect(facade).toContain('catch')
})

test('the facade still plays if the IFrame Player API fails to load or construct', () => {
  const facade = readFileSync('src/components/YouTubeFacade.astro', 'utf8')
  // The iframe is always created up front (graceful degradation): even if
  // the YT.Player wiring throws, the plain iframe embed already plays.
  expect(facade).toContain("document.createElement('iframe')")
  expect(facade.indexOf("document.createElement('iframe')")).toBeLessThan(
    facade.indexOf('new YT.Player')
  )
})

test('the article layout uses the facade and feeds the VideoObject a thumbnail', () => {
  const layout = readFileSync('src/layouts/Article.astro', 'utf8')
  expect(layout).toMatch(/<YouTubeFacade id=\{entry\.data\.youtubeId\} title=\{entry\.data\.title\} \/>/)
  expect(layout).toContain("youtubeThumbnailUrl(entry.data.youtubeId, 'sddefault')")
  expect(layout).not.toContain("'maxresdefault'")
  expect(layout).not.toContain('https://www.youtube.com/embed/')
})
