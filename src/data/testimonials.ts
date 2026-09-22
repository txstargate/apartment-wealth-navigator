// Client quotes for the landing pages. The three below are the quotes that
// ran on the go.shafiqhirani.com NOI Navigator funnel; Shafiq asked for them
// to be placed on 2026-09-22 and is compiling the full testimonial data file
// (names, buildings, sources) that will replace or extend this list. Every
// entry needs a source a reader could be pointed to on request.

export interface Testimonial {
  quote: string
  name: string
  building: string
  /** Where the quote can be verified, e.g. "LinkedIn recommendation, 2025-03". */
  source: string
  consent: true
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "I didn't think there was much room to improve, but the Blueprint uncovered six actionable items I'd overlooked for years.",
    name: 'Priya M.',
    building: 'Owner, 18-unit boutique building',
    source: 'NOI Navigator funnel, go.shafiqhirani.com, as published; placed on Shafiq\'s instruction 2026-09-22',
    consent: true,
  },
  {
    quote: 'Our vacancy days dropped from 32 to 14 after implementing the turn-time system. That alone added $50K annually.',
    name: 'David R.',
    building: 'Owner, 64-unit mid-rise',
    source: 'NOI Navigator funnel, go.shafiqhirani.com, as published; placed on Shafiq\'s instruction 2026-09-22',
    consent: true,
  },
  {
    quote: 'Before working with Shafiq, I had no idea how much we were losing to auto-renewed vendor contracts. Never again.',
    name: 'Sandra K.',
    building: 'Owner, 34-unit value-add',
    source: 'NOI Navigator funnel, go.shafiqhirani.com, as published; placed on Shafiq\'s instruction 2026-09-22',
    consent: true,
  },
]
