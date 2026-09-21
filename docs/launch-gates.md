# Launch gates

Five gates from `site-rebuild-spec.md`. No DNS cutover until every box is checked.

- [ ] **Minimum content live.** Three services, three universal articles, three DC branches, five video companions are published (not draft). Owner: Shafiq Hirani. STATUS 2026-09-12: three services, four universal articles, and four DC branches are published after the review pass (FAQPage schema, CoStar attribution, NOI-tool CTAs). STILL OPEN: the five video companions, which need Shafiq's YouTube video IDs (`youtubeId` in each universal article's frontmatter turns on the embed and VideoObject schema). UPDATE 2026-09-20: the embed is now a click-to-play facade (`src/components/YouTubeFacade.astro`, per coach Greg): poster + play button, youtube-nocookie iframe injected on click with rel=0, playsinline and autoplay so the click counts as a view; VideoObject schema carries the YouTube thumbnail. Before embedding, strip end screens and cards from each video in YouTube Studio. IDs matched from the public channel 2026-09-20 (worth R56WzR5-k5c, NOI uV5vWlyb4iE, refinance H-ypmt3DUDA, sale 8bAqbqHjmwU, underperforming yTVnOe459vE); once committed, this gate closes for the four published universals.
- [ ] **Four GoHighLevel email/text sequences published and test-enrolled.** Owner: Shafiq Hirani.
- [x] **A test lead lands in the intended pipeline.** PASSED 2026-09-12: Shafiq submitted "tester" from the live NOI tool at apartment-wealth-navigator-1.vercel.app, saw the booking panel, found the contact and opportunity in GHL at Scorecard Downloaded, and deleted them. Workflow "NOI Tool Intake - Web" is published; webhook default lives in `src/lib/ghl.ts`.
- [ ] **Legal pages live.** Privacy, terms, brokerage disclosures, and lead-capture consent are live and reviewed by RE/MAX compliance. Owner: Shafiq Hirani (RE/MAX compliance review), Friday (build).
- [x] **301 redirect map complete (WordPress side).** DONE 2026-09-12: all ten indexed WordPress URLs are in `docs/redirects.csv`; the five that change path are live 301s in `vercel.json` and verified on the Vercel production URL. STILL OPEN: the go.shafiqhirani.com funnel paths, which are mapped only when the lead-magnet pages migrate to the site at cutover. Owner: Friday.

No DNS cutover until every box is checked.


## Greg's review, 2026-09-21 (coach read of the live site)

Fixed the same day: visible "TODO-Shafiq" booking line on the three service pages (now a link to /get-started/); TODO comments in the legal and lead pages removed (compliance review stays an open gate above, tracked here, not in the markup); referral link no longer carries a placeholder href (pre-addressed email until `PUBLIC_REFERRAL_INTAKE_URL` is set); /locations rebuilt without "Market read in progress" stubs (three jurisdiction blocks, DC links its branch articles; location pages stay draft until data lands); every article now hands off to its service page; licence verification links on /disclosures.

Still open and owner-Shafiq: (1) DC licence number on the RE/MAX profile differs from BR98379340 on the site; confirm which is current. (2) Homepage counters (225+, 75+, 155+, 35+) came from the pasted spec, never confirmed; replace with verified figures or with credential facts. (3) Fee and commission language (offer ladder exists in memory, not public). (4) Case write-ups with consent. (5) Google Business Profile reviews. (6) Referral intake form URL.
