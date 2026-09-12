import { readFileSync, existsSync } from 'node:fs'
import { test, expect } from 'vitest'

// Task 15 (build-plan.md): every old WordPress URL in docs/redirects.csv
// maps to a target that exists among the built routes. This test reads
// dist/, so run `npm run build` before `npx vitest run`.

interface RedirectRow {
  old_path: string
  new_path: string
  status: string
  note: string
}

function parseCsv(text: string): RedirectRow[] {
  const [headerLine, ...lines] = text.trim().split('\n')
  const headers = headerLine.split(',')
  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const cells = line.split(',')
      return Object.fromEntries(headers.map((h, i) => [h, cells[i]])) as unknown as RedirectRow
    })
}

function routeExistsInDist(urlPath: string): boolean {
  const clean = urlPath.replace(/^\//, '').replace(/\/$/, '')
  const indexFile = clean === '' ? 'dist/index.html' : `dist/${clean}/index.html`
  return existsSync(indexFile)
}

const rows = parseCsv(readFileSync('docs/redirects.csv', 'utf8'))

test('docs/redirects.csv has the ten rows from redirects-inventory.md', () => {
  expect(rows).toHaveLength(10)
})

test('every redirect target exists among the built routes', () => {
  expect(existsSync('dist'), 'run `npm run build` before this test').toBe(true)

  for (const row of rows) {
    expect(row.new_path, `row for ${row.old_path} is missing a new_path`).toBeTruthy()
    expect(
      routeExistsInDist(row.new_path),
      `target ${row.new_path} (redirected from ${row.old_path}) has no matching route in dist/`,
    ).toBe(true)
  }
})

test('vercel.json only emits a live redirect where the path actually changes', () => {
  const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'))
  const changedRows = rows.filter((row) => row.old_path !== row.new_path)

  // Rows where old_path === new_path (home, /about/, /contact/, /insights/,
  // /services/) need no live rule -- a self-redirect would 301 a page back
  // to itself, an infinite loop in the browser. docs/redirects.csv still
  // documents all ten rows for the migration record.
  expect(vercelConfig.redirects).toHaveLength(changedRows.length)

  for (const row of changedRows) {
    const match = vercelConfig.redirects.find((r: { source: string }) => r.source === row.old_path)
    expect(match, `vercel.json is missing a redirect for ${row.old_path}`).toBeTruthy()
    expect(match.destination).toBe(row.new_path)
    expect(match.permanent).toBe(true)
  }

  const selfRows = rows.filter((row) => row.old_path === row.new_path)
  for (const row of selfRows) {
    const match = vercelConfig.redirects.find((r: { source: string }) => r.source === row.old_path)
    expect(match, `${row.old_path} maps to itself and should not have a live redirect rule`).toBeFalsy()
  }
})
