import { readFileSync, existsSync } from 'node:fs'
import { test, expect } from 'vitest'
import {
  benchmarkSource,
  BENCHMARK_SOURCE_NATIONAL,
  BENCHMARK_SOURCE_DMV,
  COSTAR_ATTRIBUTION_NOTE,
} from '../src/lib/benchmark'

test('a DMV location gets the CoStar source line with attribution', () => {
  const result = benchmarkSource('Washington, DC')
  expect(result.label).toBe(`Source: ${BENCHMARK_SOURCE_DMV}`)
  expect(result.attribution).toBe(COSTAR_ATTRIBUTION_NOTE)
})

test('an out-of-area location gets the national source line with no attribution note', () => {
  const result = benchmarkSource('Chicago, IL')
  expect(result.label).toBe(`Source: ${BENCHMARK_SOURCE_NATIONAL}`)
  expect(result.attribution).toBeUndefined()
})

test('the source label switches when the route switches', () => {
  const local = benchmarkSource('20009')
  const referral = benchmarkSource('35801')
  expect(local.label).not.toBe(referral.label)
})

test('the NOI tool wires its benchmark line to the shared source function, not a hardcoded string', () => {
  const tool = readFileSync('src/pages/tools/noi-check.astro', 'utf8')
  expect(tool).toContain("import { benchmarkSource } from '../../lib/benchmark'")
  expect(tool).toContain('updateBenchmarkSource')
  expect(tool).not.toContain('TODO-Shafiq')
})

test('the locations pages cite CoStar via the shared constants', () => {
  const index = readFileSync('src/pages/locations/index.astro', 'utf8')
  const slugPage = readFileSync('src/pages/locations/[slug].astro', 'utf8')
  expect(index).toContain("from '../../lib/benchmark'")
  expect(index).toContain('Source: {BENCHMARK_SOURCE_DMV}')
  expect(slugPage).toContain("from '../../lib/benchmark'")
  expect(slugPage).toContain('Source: {BENCHMARK_SOURCE_DMV}')
})

test('the built /locations index carries the "Source: CoStar" attribution line', () => {
  expect(existsSync('dist'), 'run `npm run build` before this test').toBe(true)
  const built = readFileSync('dist/locations/index.html', 'utf8')
  expect(built).toContain('Source: CoStar')
})
