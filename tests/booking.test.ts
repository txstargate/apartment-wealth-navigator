import { describe, it, expect } from 'vitest'
import { bookingUrl, DEFAULT_GHL_BOOKING_URL } from '../src/lib/booking'

describe('bookingUrl', () => {
	it('falls back to the live GHL booking widget when the env var is unset', () => {
		expect(bookingUrl(undefined)).toBe(DEFAULT_GHL_BOOKING_URL)
		expect(bookingUrl('')).toBe(DEFAULT_GHL_BOOKING_URL)
		expect(DEFAULT_GHL_BOOKING_URL).toMatch(/^https:\/\/api\.leadconnectorhq\.com\/widget\/booking\//)
	})
	it('prefers the env override when set', () => {
		expect(bookingUrl('https://example.com/book')).toBe('https://example.com/book')
	})
})
