import { test, expect } from 'vitest'
import { isLikelyBot } from '../src/lib/antispam'

// Honeypot spam guard (2026-09-26): a hidden "website" field no real owner
// ever fills in. Any value in it, including browser-autofill garbage split
// across whitespace, marks the submission as a bot. Empty and unset stay
// human, so autofill-on-a-blank-field never false-positives a real lead.

test('isLikelyBot is false for an empty string', () => {
  expect(isLikelyBot('')).toBe(false)
})

test('isLikelyBot is false for whitespace-only value', () => {
  expect(isLikelyBot('   ')).toBe(false)
})

test('isLikelyBot is false for null', () => {
  expect(isLikelyBot(null)).toBe(false)
})

test('isLikelyBot is false for undefined', () => {
  expect(isLikelyBot(undefined)).toBe(false)
})

test('isLikelyBot is true for any non-empty trimmed value', () => {
  expect(isLikelyBot('http://spam.example')).toBe(true)
})

test('isLikelyBot is true for a value that is only whitespace-padded content', () => {
  expect(isLikelyBot('  x  ')).toBe(true)
})
