// Background loop videos (hero and location headers). The <video> ships
// with no source; this attaches it only when the loop will actually play:
// a screen wider than a phone and no reduced-motion preference. Phones and
// reduced-motion visitors keep the poster image and download nothing.
// Pure DOM, no framework. Used by src/pages/index.astro and
// src/pages/locations/[slug].astro.

export const LOOP_MEDIA_QUERY = '(min-width: 641px) and (prefers-reduced-motion: no-preference)'

export function shouldPlayLoops(mq: { matches: boolean } = window.matchMedia(LOOP_MEDIA_QUERY)): boolean {
  return mq.matches
}

export function attachLoopVideos(root: ParentNode = document): number {
  if (!shouldPlayLoops()) return 0
  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>('video[data-src]'))
  for (const video of videos) {
    const src = video.dataset.src
    if (!src) continue
    video.src = src
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true })
    const attempt = video.play()
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {
        // Autoplay refused (battery saver, data saver): the poster stays.
      })
    }
  }
  return videos.length
}
