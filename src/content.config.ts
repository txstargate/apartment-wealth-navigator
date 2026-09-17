import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Shared frontmatter shape for both content layers. See
// content-architecture.md for why the site splits into universal
// (reach + referral) and dc (search capture + Shafiq's own deals).
export const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  pillar: z.enum(['valuation', 'noi', 'refinance', 'sale']),
  youtubeId: z.string().optional(),
  dcCounterpart: z.string().optional(),
  universalParent: z.string().optional(),
  publishDate: z.coerce.date(),
  draft: z.boolean().default(false),
  // The body carries its own counterpart link and "Get a read" CTA, so the
  // layout skips its generic crosslink and GeoCTA (review 2026-09-12).
  inlineCtas: z.boolean().default(false),
  // Mirrors the body's "Frequently asked questions" section so the page emits
  // FAQPage JSON-LD (AEO, content-architecture.md). Keep in sync with the body.
  faq: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
})

const universal = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/universal' }),
  schema: articleSchema,
})

const dc = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/dc' }),
  schema: articleSchema,
})

const serviceSchema = z.object({
  title: z.string(),
  description: z.string(),
  pillar: z.enum(['noi', 'refinance', 'sale']),
  faq: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    }),
  ),
})

const services = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/services' }),
  schema: serviceSchema,
})

// DMV location pages: a plain-language market read per jurisdiction,
// each carrying its own comps and a "data as of" date once the
// remax-intel refresh loads them. See content-architecture.md, "DMV hub
// and location pages", and build-plan.md Task 20.
export const locationSchema = z.object({
  name: z.string(),
  slug: z.string(),
  jurisdiction: z.string(),
  summary: z.string(),
  dataAsOf: z.coerce.date().optional(),
  draft: z.boolean().default(false),
})

// Header photograph per location page (design pass, 2026-09-17). The
// image() helper resolves the path relative to the content file and lets
// <Image> generate responsive sizes. Alt text stays generic by rule: these
// are DC-style buildings, not a named block.
export const locationSchemaWithImage = ({ image }: { image: () => z.ZodTypeAny }) =>
  locationSchema.extend({
    headerImage: image().optional(),
    headerAlt: z.string().optional(),
  })

const locations = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/locations' }),
  schema: locationSchemaWithImage,
})

export const collections = { universal, dc, services, locations }
