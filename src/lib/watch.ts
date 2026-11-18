// Video watch pages (pilot, 2026-11-18). Search Console flagged all 26
// companion videos "Video isn't on a watch page": the articles hold a
// click-to-play facade, so the HTML has no player for Google to find. A watch
// page puts a real iframe in the first response and leads with the video.
//
// Lives under /watch/, never /video/, where the self-hosted hero loops sit.
// To add a video, add its article slug here. Keep the pilot at 3 to 5 until
// Search Console shows whether Google indexes them.

import { youtubeWatchUrl } from './youtube'

const SITE = 'https://apartmentwealthnavigator.com'

export const WATCH_PILOT_SLUGS: string[] = [
  'whats-my-apartment-building-worth',
  'how-to-increase-noi-small-apartment-building',
  'fixed-vs-floating-apartment-loan-structure',
  '5-signals-time-to-sell-apartment-building',
]

export function hasWatchPage(slug: string): boolean {
  return WATCH_PILOT_SLUGS.includes(slug)
}

export function watchPath(slug: string): string {
  return `/watch/${slug}/`
}

export function watchUrl(slug: string): string {
  return `${SITE}${watchPath(slug)}`
}

/** Plain player URL. No autoplay: the visitor presses play, which is what counts a view. */
export function watchEmbedUrl(id: string): string {
  const params = new URLSearchParams({ rel: '0', playsinline: '1', color: 'white' })
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}

export interface WatchVideoSchemaInput {
  title: string
  description: string
  uploadDate: string
  youtubeId: string
  thumbnailUrl?: string
  pageUrl: string
}

export function buildWatchVideoSchema(input: WatchVideoSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: input.title,
    description: input.description,
    uploadDate: input.uploadDate,
    embedUrl: watchEmbedUrl(input.youtubeId),
    contentUrl: youtubeWatchUrl(input.youtubeId),
    ...(input.thumbnailUrl ? { thumbnailUrl: [input.thumbnailUrl] } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.pageUrl },
  }
}

/** Page title for the watch page: "Video: " plus the article's search title when it stays within 60 characters. */
export function watchTitle(base: string): string {
  const withPrefix = `Video: ${base}`
  return withPrefix.length <= 60 ? withPrefix : base
}
