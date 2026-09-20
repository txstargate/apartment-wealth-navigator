# Launch gates

Five gates from `site-rebuild-spec.md`. No DNS cutover until every box is checked.

- [ ] **Minimum content live.** Three services, three universal articles, three DC branches, five video companions are published (not draft). Owner: Shafiq Hirani. STATUS 2026-09-12: three services, four universal articles, and four DC branches are published after the review pass (FAQPage schema, CoStar attribution, NOI-tool CTAs). STILL OPEN: the five video companions, which need Shafiq's YouTube video IDs (`youtubeId` in each universal article's frontmatter turns on the embed and VideoObject schema). UPDATE 2026-09-20: the embed is now a click-to-play facade (`src/components/YouTubeFacade.astro`, per coach Greg): poster + play button, youtube-nocookie iframe injected on click with rel=0, playsinline and autoplay so the click counts as a view; VideoObject schema carries the YouTube thumbnail. Before embedding, strip end screens and cards from each video in YouTube Studio.
- [ ] **Four GoHighLevel email/text sequences published and test-enrolled.** Owner: Shafiq Hirani.
- [x] **A test lead lands in the intended pipeline.** PASSED 2026-09-12: Shafiq submitted "tester" from the live NOI tool at apartment-wealth-navigator-1.vercel.app, saw the booking panel, found the contact and opportunity in GHL at Scorecard Downloaded, and deleted them. Workflow "NOI Tool Intake - Web" is published; webhook default lives in `src/lib/ghl.ts`.
- [ ] **Legal pages live.** Privacy, terms, brokerage disclosures, and lead-capture consent are live and reviewed by RE/MAX compliance. Owner: Shafiq Hirani (RE/MAX compliance review), Friday (build).
- [x] **301 redirect map complete (WordPress side).** DONE 2026-09-12: all ten indexed WordPress URLs are in `docs/redirects.csv`; the five that change path are live 301s in `vercel.json` and verified on the Vercel production URL. STILL OPEN: the go.shafiqhirani.com funnel paths, which are mapped only when the lead-magnet pages migrate to the site at cutover. Owner: Friday.

No DNS cutover until every box is checked.
