// Background loop videos (hero and location headers). Pure DOM, no framework.
//
// Two behaviours share one loader:
//
// 1. A single loop: <video data-src="..." data-src-mobile="..."> gets its
//    source attached and plays. The still under it stays as the poster.
//
// 2. A playlist (the homepage hero): a container with data-playlist (a JSON
//    array of {src, mobile} entries) and two stacked <video> elements. The
//    first clip plays, and near its end the next clip is preloaded on the
//    other element and crossfaded in. Phones get the lighter mobile files.
//
// Reduced-motion visitors get neither: the poster image stays and nothing
// downloads. This is a deliberate accessibility choice, not a size limit.

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
export const MOBILE_QUERY = '(max-width: 640px)'

export interface PlaylistEntry {
  src: string
  mobile?: string
}

export function motionAllowed(mq: { matches: boolean } = window.matchMedia(REDUCED_MOTION_QUERY)): boolean {
  return !mq.matches
}

export function pickSource(entry: PlaylistEntry, isMobile: boolean): string {
  return isMobile && entry.mobile ? entry.mobile : entry.src
}

export function nextIndex(current: number, length: number): number {
  return length === 0 ? 0 : (current + 1) % length
}

/** Seconds before the end of a clip at which the crossfade starts. */
export const CROSSFADE_LEAD_SECONDS = 0.8

function playQuietly(video: HTMLVideoElement): void {
  const attempt = video.play()
  if (attempt && typeof attempt.catch === 'function') {
    attempt.catch(() => {
      // Autoplay refused (battery saver, data saver): the poster stays.
    })
  }
}

export function attachSingleLoops(root: ParentNode, isMobile: boolean): number {
  const videos = Array.from(root.querySelectorAll<HTMLVideoElement>('video[data-src]'))
  for (const video of videos) {
    const src = pickSource({ src: video.dataset.src ?? '', mobile: video.dataset.srcMobile }, isMobile)
    if (!src) continue
    video.src = src
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true })
    playQuietly(video)
  }
  return videos.length
}

export function attachPlaylists(root: ParentNode, isMobile: boolean): number {
  const stages = Array.from(root.querySelectorAll<HTMLElement>('[data-playlist]'))
  for (const stage of stages) {
    let entries: PlaylistEntry[] = []
    try {
      entries = JSON.parse(stage.dataset.playlist ?? '[]')
    } catch {
      entries = []
    }
    const layers = Array.from(stage.querySelectorAll<HTMLVideoElement>('video'))
    if (entries.length === 0 || layers.length < 2) continue

    let index = 0
    let active = 0
    let switching = false

    const load = (layer: HTMLVideoElement, entry: PlaylistEntry) => {
      layer.src = pickSource(entry, isMobile)
      layer.load()
    }

    const show = (layer: HTMLVideoElement) => {
      layer.classList.add('is-playing')
      playQuietly(layer)
    }

    const onTime = (layer: HTMLVideoElement) => () => {
      if (switching || layer !== layers[active]) return
      if (!layer.duration || layer.currentTime < layer.duration - CROSSFADE_LEAD_SECONDS) return
      switching = true
      const next = 1 - active
      const nextEntry = entries[nextIndex(index, entries.length)]
      const nextLayer = layers[next]
      load(nextLayer, nextEntry)
      const start = () => {
        show(nextLayer)
        layer.classList.remove('is-playing')
        index = nextIndex(index, entries.length)
        active = next
        window.setTimeout(() => {
          layer.pause()
          switching = false
        }, 700)
      }
      if (nextLayer.readyState >= 3) start()
      else nextLayer.addEventListener('canplay', start, { once: true })
    }

    for (const layer of layers) {
      layer.loop = entries.length === 1
      layer.addEventListener('timeupdate', onTime(layer))
    }
    load(layers[0], entries[0])
    show(layers[0])
  }
  return stages.length
}

export function attachLoopVideos(root: ParentNode = document): number {
  if (!motionAllowed()) return 0
  const isMobile = window.matchMedia(MOBILE_QUERY).matches
  return attachPlaylists(root, isMobile) + attachSingleLoops(root, isMobile)
}
