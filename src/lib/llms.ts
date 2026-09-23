// Pure builder for /llms.txt. No Astro imports so it is unit-testable.

export interface LlmsEntry {
  slug: string
  title: string
  description: string
}

export interface LlmsInput {
  universal: LlmsEntry[]
  dc: LlmsEntry[]
  services: LlmsEntry[]
  locations: LlmsEntry[]
}

const SITE = 'https://apartmentwealthnavigator.com'

function line(url: string, title: string, description: string): string {
  return `- [${title}](${url}): ${description}`
}

export function buildLlmsTxt(input: LlmsInput): string {
  const out: string[] = []
  out.push('# Apartment Wealth Navigator')
  out.push('')
  out.push(
    '> Commercial real estate advisory for owners of small and mid-sized apartment buildings in Washington DC, Virginia, and Maryland. Shafiq Hirani (CCIM, MBA, PE; licensed broker in DC, VA, and MD; RE/MAX Distinctive Commercial) works three problems: raising net operating income (NOI), positioning a building for refinance, and preparing a building for sale.',
  )
  out.push('')
  out.push('Every article states its numbers with the arithmetic shown. Figures for DC buildings are attributed to their source in the article. Nothing on the site is an appraisal or a broker opinion of value.')
  out.push('')
  out.push('## Services')
  out.push('')
  for (const s of input.services) out.push(line(`${SITE}/services/${s.slug}/`, s.title, s.description))
  out.push('')
  out.push('## Guides and articles')
  out.push('')
  for (const a of input.universal) out.push(line(`${SITE}/insights/${a.slug}/`, a.title, a.description))
  out.push('')
  out.push('## Washington DC branch')
  out.push('')
  for (const a of input.dc) out.push(line(`${SITE}/insights/${a.slug}/`, a.title, a.description))
  if (input.locations.length) {
    out.push('')
    out.push('## Markets')
    out.push('')
    for (const l of input.locations) out.push(line(`${SITE}/locations/${l.slug}/`, l.title, l.description))
  }
  out.push('')
  out.push('## Tools')
  out.push('')
  out.push(line(`${SITE}/tools/noi-check/`, 'NOI Quick Check', 'A free calculator: current NOI, the annual NOI gap, and the estimated value impact at your cap rate. An educational estimate.'))
  out.push('')
  out.push('## Free audit')
  out.push('')
  out.push(line(`${SITE}/noi-navigator/`, 'NOI Navigator™: the NOI Leak Audit', 'A one-page, five-question audit that finds the two levers draining NOI on a small apartment building, plus a free 15-minute diagnostic.'))
  out.push(line(`${SITE}/refinance-readiness/`, 'Refinance Navigator™: the Lender-Ready Package Checklist', 'A 60-second readiness score and a one-page checklist of what a lender will ask for, for owners refinancing in the next 6 to 24 months.'))
  out.push(line(`${SITE}/sale-readiness/`, 'Exit Navigator™: the Sale Readiness Scorecard', 'A 10-minute, two-part scorecard: the five sell and three wait signals, and five file-readiness statements scored out of 25, with a free confidential seller strategy call.'))
  out.push(line(`${SITE}/value-navigator/`, 'Value Navigator™: what is your apartment building worth', 'A free three-number value range (conservative, base, optimistic) built the way lenders and buyers underwrite, plus the Value Range Worksheet to run the NOI haircut yourself.'))
  out.push('')
  out.push('## Results')
  out.push('')
  out.push(line(`${SITE}/results/`, 'Results', 'Three DC apartment-owner engagements written up by situation, advice and outcome, names withheld.'))
  out.push('')
  out.push('## About and contact')
  out.push('')
  out.push(line(`${SITE}/about/`, 'About Shafiq Hirani', 'Credentials, licences, and how a building review runs.'))
  out.push(line(`${SITE}/contact/`, 'Contact', 'Request a building audit. Mobile +1-202-290-1055. Email shirani@enterprisere.com.'))
  out.push('')
  return out.join('\n')
}
