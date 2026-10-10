import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

// Brand decisions of 2026-10-10 (Shafiq, Ronsley workbook): the audience is
// owners of 4 to 20 unit buildings, growing to 50 later; the villain is
// set-and-forget ownership (Joanna Wiebe's brand framework).

const NAVIGATORS = ['noi-navigator', 'refinance-readiness', 'sale-readiness']

test('every Navigator page states the 4 to 20 unit audience', () => {
  for (const slug of NAVIGATORS) {
    const page = readFileSync(`src/pages/${slug}.astro`, 'utf8')
    expect(page, slug).toContain('owners of 4 to 20 unit buildings')
    expect(page, slug).not.toMatch(/\b3 to 2[05] unit/)
  }
})

test('the homepage and About page name the villain', () => {
  for (const file of ['src/pages/index.astro', 'src/pages/about.astro']) {
    expect(readFileSync(file, 'utf8'), file).toContain('set-and-forget ownership')
  }
})
