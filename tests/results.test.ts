import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { RESULTS, RESULTS_NOTE } from '../src/data/results'

// Client results (2026-09-21, Greg's "add real social proof"). Anonymised
// until consent is on file, every case carries an outcome, and the free
// first call is stated wherever an owner decides to reach out.

const CLIENT_NAMES = ['Laura', 'Alan', 'Anexora', 'Nega', 'Terry', 'Silky', 'Bitar', 'Teshome']

test('results are anonymised, complete, and attributed', () => {
  expect(RESULTS.length).toBeGreaterThanOrEqual(3)
  for (const r of RESULTS) {
    const text = [r.headline, r.building, r.situation, r.advice, r.outcome, r.lesson].join(' ')
    for (const name of CLIENT_NAMES) expect(text).not.toMatch(new RegExp(`\\b${name}\\b`))
    expect(r.outcome.length).toBeGreaterThan(40)
    expect(text).not.toContain('—')
  }
  expect(RESULTS_NOTE).toContain('Names withheld')
  expect(RESULTS_NOTE).toContain('do not predict yours')
})

test('results page and homepage band render the write-ups with the note', () => {
  const page = readFileSync('src/pages/results/index.astro', 'utf8')
  expect(page).toContain('RESULTS.map(')
  expect(page).toContain('{RESULTS_NOTE}')
  const home = readFileSync('src/pages/index.astro', 'utf8')
  expect(home).toContain('class="content-block results-band"')
  expect(home).toContain('href="/results/"')
})

test('the free first call is stated on the services index, get-started, and every service page', () => {
  const line = 'The first call is free.'
  expect(readFileSync('src/pages/services/index.astro', 'utf8')).toContain(line)
  expect(readFileSync('src/pages/get-started.astro', 'utf8')).toContain(line)
  for (const f of ['noi', 'refinance', 'sale']) expect(readFileSync(`src/content/services/${f}.md`, 'utf8')).toContain(line)
})
