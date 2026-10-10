// Client quotes for the landing pages. Empty on purpose: the three quotes
// copied from the go.shafiqhirani.com NOI Navigator funnel (Priya M., David R.,
// Sandra K.) had no source on file and matched composite campaign characters,
// so Shafiq had them removed on 2026-10-10. The landing pages hide the quote
// section while this list is empty. Add only real quotes, each with a source
// a reader could be pointed to on request and the owner's consent.

export interface Testimonial {
  quote: string
  name: string
  building: string
  /** Where the quote can be verified, e.g. "LinkedIn recommendation, 2025-03". */
  source: string
  consent: true
}

export const TESTIMONIALS: Testimonial[] = []
