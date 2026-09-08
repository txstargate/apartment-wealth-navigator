import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Shared frontmatter shape for both content layers. See
// content-architecture.md for why the site splits into universal
// (reach + referral) and dc (search capture + Shafiq's own deals).
const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  pillar: z.enum(['noi', 'refinance', 'sale']),
  youtubeId: z.string().optional(),
  dcCounterpart: z.string().optional(),
  universalParent: z.string().optional(),
  publishDate: z.coerce.date(),
  draft: z.boolean().default(false),
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

export const collections = { universal, dc, services }
