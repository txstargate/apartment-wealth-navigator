import { test, expect } from 'vitest'
import { motionAllowed, pickSource, nextIndex, CROSSFADE_LEAD_SECONDS, MOBILE_QUERY, REDUCED_MOTION_QUERY } from '../src/lib/loop-video'

// The loops play everywhere except for visitors who asked for reduced
// motion. Phones get the lighter mobile file. The hero playlist walks the
// clips in order and wraps.

test('reduced motion is the only thing that turns the loops off', () => {
  expect(REDUCED_MOTION_QUERY).toBe('(prefers-reduced-motion: reduce)')
  expect(motionAllowed({ matches: false })).toBe(true)
  expect(motionAllowed({ matches: true })).toBe(false)
})

test('phones get the mobile file when one exists, otherwise the main file', () => {
  expect(MOBILE_QUERY).toBe('(max-width: 640px)')
  const entry = { src: '/video/a.mp4', mobile: '/video/mobile/a.mp4' }
  expect(pickSource(entry, true)).toBe('/video/mobile/a.mp4')
  expect(pickSource(entry, false)).toBe('/video/a.mp4')
  expect(pickSource({ src: '/video/b.mp4' }, true)).toBe('/video/b.mp4')
})

test('the playlist advances in order and wraps to the start', () => {
  expect(nextIndex(0, 6)).toBe(1)
  expect(nextIndex(5, 6)).toBe(0)
  expect(nextIndex(0, 1)).toBe(0)
  expect(CROSSFADE_LEAD_SECONDS).toBeGreaterThan(0)
})
