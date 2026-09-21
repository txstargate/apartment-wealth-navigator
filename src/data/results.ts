// Client results shown on /results and the homepage. Every fact here is
// as reported by Shafiq Hirani (source: briefs/bni/2026-09-24-client-stories.md,
// prepared 20 September 2026). Owners are not named on the site until
// written consent is on file; the write-ups stay anonymised by building,
// area and outcome. Add a `year` only when Shafiq has confirmed it.

export interface CaseResult {
  id: string
  pillar: 'noi' | 'sale' | 'refinance'
  headline: string
  building: string
  year?: string
  situation: string
  advice: string
  outcome: string
  lesson: string
}

export const RESULTS: CaseResult[] = [
  {
    id: 'four-unit-rents-tripled',
    pillar: 'noi',
    headline: 'Rents tripled, NOI roughly quadrupled, building still held',
    building: 'Four-unit apartment building, Washington DC. Owner met through a mailed package, about nine years ago.',
    year: '2017',
    situation:
      'The owner had bought the building off-market from a colleague, with no broker on either side, and planned to hold it for retirement. She described it as doing well and needing some TLC. Rents were at about a third of what the market could bear.',
    advice:
      'Tour the building, go through the planned renovations and the rents, then renovate strategically and turn units over as leases came up, with a tighter tenant screening process.',
    outcome: 'Rents tripled and NOI roughly quadrupled. She still owns the building.',
    lesson: '"Doing well" and "performing to potential" are two different things.',
  },
  {
    id: 'dupont-brownstones-five-offers',
    pillar: 'sale',
    headline: 'Five offers at one open house, sold at $2.2M with minimal contingencies',
    building: 'Two connected brownstones a block from Dupont Circle, Washington DC, run for years as a bed-and-breakfast.',
    situation:
      'Revenue was down and expenses were up. The owners disagreed about selling and needed proceeds for the family. One building already worked as a four-bedroom home with two rental units; the other suited eight studio units plus a den.',
    advice:
      'Minor renovations on the first building, kitchen and paint. Position the second for short-term rental. List both, individually or together, at $2M each.',
    outcome:
      'The open house produced five offers on the three-unit building around $2.1M and one offer on the pair at $4M. The three-unit closed at $2.2M with minimal contingencies, the highest price in the area per square foot and per unit. The second building went to short-term rental.',
    lesson: 'Price the outcome the owners need, not the building they happen to own.',
  },
  {
    id: 'dupont-four-unit-six-offers',
    pillar: 'sale',
    headline: 'Six offers in seven days, above the seller’s own expectation, no contingencies',
    building: 'Four-unit apartment building, Dupont, Washington DC. Owner met through a mailed package.',
    situation:
      'The owner was moving out of town and needed to sell. He lived in one unit and a second was empty, so two of four units would be vacant at sale. Other agents had told him to leave both empty so the new owner would have flexibility.',
    advice:
      'Refresh both vacant units and place new tenants at higher rents than before, then clear the deferred maintenance before the building goes to market. Most buyers of a four-unit building want cash flow, not flexibility.',
    outcome: 'One open house produced six offers within seven days. The building sold above the price the seller expected, with no contingencies.',
    lesson: 'A buyer pays for income he can see, not for flexibility he has to imagine.',
  },
]

export const RESULTS_NOTE =
  'Results as reported by the owners to Shafiq Hirani. Names withheld until each owner agrees in writing to be named. Past results describe those buildings and do not predict yours.'
