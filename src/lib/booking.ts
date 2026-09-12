// Shafiq's live GoHighLevel booking widget. Source: the contact.html in the
// plain-HTML site he had connected to Vercel (apartment-wealth-navigator zip,
// 2026-09-12). Override per environment with PUBLIC_GHL_BOOKING_URL.
export const DEFAULT_GHL_BOOKING_URL =
	'https://api.leadconnectorhq.com/widget/booking/J08lJtHj7sIX32V5TtN4'

export function bookingUrl(envValue?: string): string {
	return envValue && envValue.trim() !== '' ? envValue : DEFAULT_GHL_BOOKING_URL
}
