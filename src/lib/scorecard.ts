// Sale Readiness Scorecard: two halves, as the "5 Signals" guide frames the
// sale decision. Timing: which of the five sell signals and three wait
// signals apply. Readiness: five file statements scored 1 to 5, banded the
// same way as the refinance readiness score. Pure, shared by page and tests.
import { readinessBand, readinessTotal, type ReadinessBand } from './readiness'

export const SELL_SIGNALS = [
  'A loan maturing inside 24 months',
  'A capital expense wall the building cannot fund from cash flow',
  'An NOI ceiling: the next dollar of income costs more than a dollar to get',
  'A wide spread between what you paid and what the building is worth today',
  'A partnership change or a life event that shortens your hold',
] as const

export const WAIT_SIGNALS = [
  'Unrecovered NOI leaks still sitting in the operating statement',
  'Rents mid-repositioning that the trailing 12 months do not show yet',
  'A prepayment penalty that has not aged out',
] as const

export const READINESS_STATEMENTS = [
  'My rent roll matches the signed leases on rent, deposit, term, and concessions',
  'Every expense spike in the last three years has an invoice and a one-line explanation',
  'Who pays which utility, and how reimbursements are tracked, is written down',
  'I know my deferred maintenance and roughly what it costs before an inspector finds it',
  'Permits, registrations, and inspections for the building are current and in one file',
] as const

export interface TimingRead {
  sell: number
  wait: number
  label: string
  advice: string
}

export function timingRead(sell: number, wait: number): TimingRead {
  if (sell === 0 && wait === 0) return { sell, wait, label: 'No signal yet', advice: 'Nothing is forcing the decision. Use the time to close the readiness gaps below.' }
  if (wait > 0 && wait >= sell) return { sell, wait, label: 'Wait on purpose', advice: 'The wait signals outweigh the sell signals. Fix what is holding value back, then decide with a date attached.' }
  if (sell >= 2 && wait === 0) return { sell, wait, label: 'The signals say sell', advice: 'Two or more sell signals and nothing saying wait. The question is no longer whether, it is how well prepared the file is.' }
  return { sell, wait, label: 'Mixed signals', advice: 'Sell signals are present but something says wait. Price the wait against the sell signal with the shortest clock, usually the loan.' }
}

export interface ScorecardResult {
  timing: TimingRead
  readinessTotal: number
  readiness: ReadinessBand
  summary: string
}

export function scorecard(sellFlags: boolean[], waitFlags: boolean[], readiness: number[]): ScorecardResult {
  const timing = timingRead(sellFlags.filter(Boolean).length, waitFlags.filter(Boolean).length)
  const total = readinessTotal(readiness)
  const band = readinessBand(total)
  return {
    timing,
    readinessTotal: total,
    readiness: band,
    summary: `Timing: ${timing.label} (${timing.sell} sell, ${timing.wait} wait). Readiness: ${total}/25, ${band.label}.`,
  }
}
