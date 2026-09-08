// JSON-LD builders shared by the article template, service pages, and
// the About page. Each function returns a plain object ready to pass
// to <JsonLd data={...} /> -- it does not touch the DOM or Astro props.

export interface ArticleSchemaInput {
  title: string
  description: string
  url: string
  author: string
  datePublished?: string
  dateModified?: string
}

export function buildArticleSchema(input: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: input.url,
    author: {
      '@type': 'Person',
      name: input.author,
    },
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  }
}

export interface VideoSchemaInput {
  title: string
  description: string
  uploadDate: string
  embedUrl: string
  thumbnailUrl?: string
}

export function buildVideoSchema(input: VideoSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: input.title,
    description: input.description,
    uploadDate: input.uploadDate,
    embedUrl: input.embedUrl,
    ...(input.thumbnailUrl ? { thumbnailUrl: [input.thumbnailUrl] } : {}),
  }
}

export interface FaqItem {
  question: string
  answer: string
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
