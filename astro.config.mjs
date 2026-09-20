// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';
import { collectLastmodSources, lastmodFor } from './src/lib/sitemap-lastmod.ts';

// Sitemap lastmod (2026-09-20): articles carry their publishDate, static
// pages the last git commit of their source, anything else no lastmod.
const root = fileURLToPath(new URL('.', import.meta.url));
const lastmodSources = collectLastmodSources(root);

// https://astro.build/config
export default defineConfig({
	site: 'https://apartmentwealthnavigator.com',
	integrations: [
		mdx(),
		sitemap({
			serialize(item) {
				const lastmod = lastmodFor(item.url, lastmodSources);
				return lastmod ? { ...item, lastmod } : item;
			},
		}),
	],
});
