// YouTube embed helpers. Pure functions, no DOM. Used by the
// YouTubeFacade component and the Article layout's VideoObject schema.
//
// Rules (Greg, 2026-09-20; YouTube player-parameter docs):
// - Views count only when playback is user-initiated in a player at least
//   200x200 and about half visible. A silent autoplay loop earns nothing,
//   which is why the hero loops are self-hosted and the companion videos
//   are click-to-play.
// - youtube-nocookie.com drops no tracking cookie until play.
// - rel=0 limits end-of-video suggestions to Shafiq's own channel.
// - playsinline=1 keeps iPhone from forcing fullscreen.
// - modestbranding is dead since 2023; do not send it.

export const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

export function isYouTubeId(id: string): boolean {
  return YOUTUBE_ID_PATTERN.test(id)
}

/** Embed URL for the facade to inject on click. autoplay=1 so the click that loads the player also starts it. */
export function youtubeEmbedUrl(id: string, opts: { autoplay?: boolean } = {}): string {
  const params = new URLSearchParams({ rel: '0', playsinline: '1', color: 'white' })
  if (opts.autoplay) params.set('autoplay', '1')
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}

/** Poster image for the facade and the VideoObject thumbnailUrl. */
export function youtubeThumbnailUrl(id: string, size: 'hqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'): string {
  return `https://i.ytimg.com/vi/${id}/${size}.jpg`
}

/** Plain watch link for the schema's contentUrl and as a no-JS fallback. */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}

/** The iframe allow list YouTube documents for embedded players. */
export const YOUTUBE_IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
