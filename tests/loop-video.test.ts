import { test, expect } from 'vitest'
import { shouldPlayLoops, LOOP_MEDIA_QUERY } from '../src/lib/loop-video'

// The loops only load where they will play: wide screens with motion
// allowed. Phones and reduced-motion visitors keep the poster image.

test('the media query gates on width and reduced motion together', () => {
  expect(LOOP_MEDIA_QUERY).toBe('(min-width: 641px) and (prefers-reduced-motion: no-preference)')
})

test('shouldPlayLoops follows the media query result it is given', () => {
  expect(shouldPlayLoops({ matches: true })).toBe(true)
  expect(shouldPlayLoops({ matches: false })).toBe(false)
})
