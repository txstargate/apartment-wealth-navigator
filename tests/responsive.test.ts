import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

// Mobile pass 2026-09-14. Shafiq opened apartmentwealthnavigator.com on his
// phone and the page rendered zoomed out with the header overflowing: the
// site had no media queries and a non-wrapping nav row wider than a phone.

test('header collapses its links behind a toggle under 900px', () => {
  const header = readFileSync('src/components/Header.astro', 'utf8')
  expect(header).toContain('class="site-nav__toggle"')
  expect(header).toContain('aria-controls="site-nav-menu"')
  expect(header).toContain('@media (max-width: 900px)')
  expect(header).toMatch(/\.site-nav__menu\.is-open\s*\{\s*display: flex;/)
  expect(header).toContain("menu.classList.toggle('is-open', !open)")
})

test('global styles guard against horizontal overflow and scale type on phones', () => {
  const tokens = readFileSync('src/styles/tokens.css', 'utf8')
  expect(tokens).toMatch(/body\s*\{[^}]*overflow-x: hidden/)
  expect(tokens).toMatch(/img,\s*svg,\s*video,\s*iframe\s*\{[^}]*max-width: 100%/)
  expect(tokens).toContain('@media (max-width: 640px)')
})

test('article tables scroll inside the column instead of widening the page', () => {
  const article = readFileSync('src/layouts/Article.astro', 'utf8')
  expect(article).toMatch(/\.article__body :global\(table\)\s*\{[^}]*overflow-x: auto/)
})

test('every page declares the device-width viewport', () => {
  const base = readFileSync('src/layouts/Base.astro', 'utf8')
  expect(base).toContain('<meta name="viewport" content="width=device-width" />')
})
