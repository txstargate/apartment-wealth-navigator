// lastmod for the sitemap. Pure functions plus one filesystem reader, used
// from astro.config.mjs at build time.
//
// Articles take their frontmatter publishDate. Other pages take the last git
// commit date of the page source when git knows it. Anything else gets no
// lastmod at all: a wrong date is worse than none.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface LastmodSources {
  articleDates: Record<string, string>
  pageDates: Record<string, string>
}

/** Maps a site URL to its lastmod ISO date, or undefined. */
export function lastmodFor(url: string, sources: LastmodSources): string | undefined {
  const path = new URL(url).pathname.replace(/\/$/, '') || '/'
  const insights = path.match(/^\/insights\/([^/]+)$/)
  if (insights) return sources.articleDates[insights[1]]
  return sources.pageDates[path]
}

function readPublishDates(dir: string): Record<string, string> {
  const out: Record<string, string> = {}
  let files: string[] = []
  try {
    files = readdirSync(dir).filter((f) => /\.(md|mdx)$/.test(f) && !f.startsWith('_'))
  } catch {
    return out
  }
  for (const f of files) {
    const text = readFileSync(join(dir, f), 'utf8')
    const m = text.match(/^publishDate:\s*["']?(\d{4}-\d{2}-\d{2})/m)
    if (m) out[f.replace(/\.(md|mdx)$/, '')] = m[1]
  }
  return out
}

function gitDate(file: string): string | undefined {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { encoding: 'utf8' }).trim()
    return out ? out.slice(0, 10) : undefined
  } catch {
    return undefined
  }
}

/** Collects dates from the content folders and the git history of the static pages. */
export function collectLastmodSources(root: string): LastmodSources {
  const articleDates = {
    ...readPublishDates(join(root, 'src/content/universal')),
    ...readPublishDates(join(root, 'src/content/dc')),
  }
  const staticPages: Record<string, string> = {
    '/': 'src/pages/index.astro',
    '/about': 'src/pages/about.astro',
    '/contact': 'src/pages/contact.astro',
    '/get-started': 'src/pages/get-started.astro',
    '/services': 'src/pages/services/index.astro',
    '/services/noi': 'src/content/services/noi.md',
    '/services/refinance': 'src/content/services/refinance.md',
    '/services/sale': 'src/content/services/sale.md',
    '/tools': 'src/pages/tools/index.astro',
    '/results': 'src/pages/results/index.astro',
    '/noi-navigator': 'src/pages/noi-navigator.astro',
    '/refinance-readiness': 'src/pages/refinance-readiness.astro',
    '/tools/noi-check': 'src/pages/tools/noi-check.astro',
    '/insights': 'src/pages/insights/index.astro',
    '/locations': 'src/pages/locations/index.astro',
    '/privacy': 'src/pages/privacy.astro',
  }
  const pageDates: Record<string, string> = {}
  for (const [path, file] of Object.entries(staticPages)) {
    const d = gitDate(join(root, file))
    if (d) pageDates[path] = d
  }
  return { articleDates, pageDates }
}
