// Rent-benchmark source labels for the NOI tool and the location pages.
// CoStar confirmed public display with attribution on 2026-09-12 (see
// noi-quick-check-spec.md, "CoStar confirmed"), so DMV figures cite
// CoStar and everywhere else cites the free national benchmark.

import { routeByLocation } from './geo'

export const BENCHMARK_SOURCE_NATIONAL = 'Apartment List national rent data'
export const BENCHMARK_SOURCE_DMV = 'CoStar'
export const COSTAR_ATTRIBUTION_NOTE = 'Market data © CoStar, used with permission'

export interface BenchmarkSource {
  label: string
  attribution?: string
}

export function benchmarkSource(location: string): BenchmarkSource {
  if (routeByLocation(location) === 'local') {
    return { label: `Source: ${BENCHMARK_SOURCE_DMV}`, attribution: COSTAR_ATTRIBUTION_NOTE }
  }
  return { label: `Source: ${BENCHMARK_SOURCE_NATIONAL}` }
}
