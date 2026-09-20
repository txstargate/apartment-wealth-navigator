import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { filterPublished, orderInsights } from '../lib/content'
import { buildLlmsTxt } from '../lib/llms'

// /llms.txt: a plain-text map of the site for AI crawlers and answer engines
// (AEO). Built from the content collections so it never lists a draft or a
// page that does not exist. See https://llmstxt.org for the format.
export const GET: APIRoute = async () => {
  const universal = orderInsights(filterPublished(await getCollection('universal')))
  const dc = orderInsights(filterPublished(await getCollection('dc')))
  const services = await getCollection('services')
  const locations = filterPublished(await getCollection('locations'))
  const body = buildLlmsTxt({
    universal: universal.map((e) => ({ slug: e.id, title: e.data.title, description: e.data.description })),
    dc: dc.map((e) => ({ slug: e.id, title: e.data.title, description: e.data.description })),
    services: services.map((e) => ({ slug: e.id, title: e.data.title, description: e.data.description })),
    locations: locations.map((e) => ({ slug: e.data.slug, title: e.data.name, description: e.data.summary })),
  })
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
