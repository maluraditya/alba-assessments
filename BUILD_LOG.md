# Build Log: Signal

## Goal & scope decision

- Built one single-purpose company-intelligence web app around the supplied PRD and Alba assessment checklist.
- Prioritized a premium search-to-brief experience, resilient multi-source fusion, and a memorable editorial UI.
- Deliberately excluded accounts, saved lists, CRM integrations, and invented analytics because they are outside the documented scope.

## Stack & tooling

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, shadcn/ui primitives, Framer Motion, Lucide, Zod, and Vitest.
- Next.js route handlers and server-only services form the backend-for-frontend.
- Gemini generates the optional evidence-constrained summary; Vercel is the deployment target.

## Key decisions & trade-offs

- Kept GitHub authentication optional because the report must survive GitHub failure; a token only raises the rate limit.
- Replaced discontinued Clearbit Logo with website metadata, Google favicon, and initials fallbacks.
- Used Google News RSS instead of a time-limited news API trial.
- Resolved identities conservatively through Wikidata company results with English Wikipedia sitelinks. It is better to show no match than a polished report about the wrong entity.
- Removed the initial tech-company bias and fused Wikidata suggestions with GLEIF’s global legal-entity search. Official-domain metadata remains the deterministic fallback for young or unlisted companies.
- Added a bounded public-web discovery fallback after Alba Corporation UAE proved that real companies can have a strong official site while remaining absent from both Wikidata and GLEIF.
- Rebuilt website metadata extraction around order-independent meta tags and schema.org organization records, enabling official-site identity, founding year, country, locality, and industry.
- Kept GLEIF selections tied to their unique LEI instead of re-resolving a potentially ambiguous legal name.
- Fetched secondary services in parallel and normalized each into an explicit source state. This preserves partial value under upstream failures.
- Expanded the initial search gateway into a scroll-driven landing page after review showed that the product value, workflow, and source model needed to be explained before asking for a search.
- Made report composition data-aware: verified GitHub activity retains the developer-velocity experience; absent or empty activity swaps in company context, source health, and synthesis provenance.
- Used the maintained authenticated REST Countries v5 API after browser QA exposed that the deprecated v3 URL now returns a different response envelope.
- Kept above-the-fold hero text server-visible instead of initially hiding it behind motion. This improved LCP while retaining motion on report and supporting sections.
- Replaced mount-time reveals with viewport-triggered animation after review showed that below-fold motion had already completed before the user reached it. Added scroll-linked hero parallax, staggered evidence cards, sticky pipeline storytelling, bento hover physics, a motion marquee, and a spring-smoothed progress rail.
- Replaced remotely loaded Geist files with a high-quality native system typography stack after the final motion pass exposed a late font swap as the remaining LCP bottleneck. The visual rhythm remains intentionally tuned while avoiding a render-critical font request.
- Replaced the initial dark bento/dashboard motif after visual review found it polished but too familiar. The landing page is now an editorial “evidence field”: a live source-orbit hero, a type-led research narrative, and a source constellation in one deliberate dark research environment.
- Removed the light/dark switch before release. A single dark presentation keeps the product visually consistent from the landing page through the dossier, and eliminates the theme-hydration mismatch that surfaced during local QA.
- Reworked the executive synthesis into a structured decision brief: one takeaway, a bounded evidence summary, three labelled signals, an explicit watch item, and visible AI/provenance status. The Gemini schema now enforces that structure and asks the model to state evidence limitations instead of filling gaps.
- Normalized the report into complete 12-column rows. Rich GitHub results and sparse-source fallbacks now occupy the same four-column slot, while the final timeline spans the full row; the loading skeleton mirrors the finished composition.

## Hard parts / dead ends

- The initial `Linear` test query resolved to similarly named public companies. Browser QA caught the error, leading to stricter identity matching and safer example companies.
- REST Countries changed after the original project documentation was written. The adapter was migrated to its stable v5 shape and Bearer authentication.
- Clipboard permissions failed in the controlled browser. A safe legacy-copy fallback now provides visible success or failure feedback.
- Stripe initially showed no GitHub activity because `Stripe, Inc.` became an invalid organization slug. The resolver now removes legal suffixes and tries bounded, deduplicated candidates.
- Nintendo exposed another edge case: a matching organization with zero public repositories produced three meaningless zero metrics. Zero-repository matches are now an explicit empty state and trigger the adaptive report layout.
- Broad-company QA exposed that encyclopedia-only identity resolution favored notable English-language and technology companies. The search gateway now queries public organization records and global legal entities in parallel, shows source-labelled choices while typing, and gives explicit no-match/domain guidance.
- The initial dropdown exposed seven results without an internal scroll surface. It now has viewport-bounded touch/pointer scrolling and automatically keeps keyboard selection in view.
- Bottom-of-page search exposed a perceived navigation stall: the report route reset only after its data finished loading. Search selection now closes and blurs the control, resets the viewport immediately, and explicitly requests top-position route navigation before the loading state begins.
- A five-column GitHub card was being placed beside an eight-column executive card, forcing it onto the next row and making the layout appear randomly empty. Browser checks across OpenAI and Alba exposed that the apparent randomness was entirely data-state-dependent.
- Alba Corporation UAE initially returned no result. Public-web discovery now resolves it to `albacorp.net`; schema.org extraction then supplies its Dubai/UAE identity and 2016 founding year without a hard-coded company record.
- Initial Lighthouse scores were 95/95/100/100. Contrast fixes and removing render-delayed hero motion raised the final mobile run to 96/100/100/100.
- A generated scaffolding dependency pulled in unnecessary packages and security advisories. It was removed after the needed primitive was generated; locked transitive versions now audit cleanly.

## How I verified it works

- Ran strict typecheck, zero-warning ESLint, Prettier verification, 9 unit tests, and a full optimized production build.
- Ran a production dependency audit with zero known vulnerabilities.
- Used a real search for the company Vercel to verify identity, website redirect handling, GitHub activity, RSS coverage, fused timeline, fallback synthesis, empty-search validation, browser navigation, and copy-link feedback.
- Confirmed zero horizontal overflow for both the expanded landing page and an adaptive report at 360, 768, 1024, 1440, and 2560 px.
- Verified company-specific content and layout behavior using Vercel, Stripe, Perplexity AI, and Nintendo.
- Verified non-tech identity and adaptive layout behavior using Coca-Cola, Toyota, and McDonald’s, plus explicit no-match behavior for a nonsense query.
- Verified a seven-result Toyota dropdown at desktop and 360 px mobile, including keyboard navigation to the final legal-entity result.
- Verified the complete Alba Corporation path: name search, official-site selection, structured website identity, REST Countries UAE context, recent-news empty state, and Gemini-grounded synthesis.
- Compared the redesigned report with OpenAI (full GitHub evidence) and Alba Corporation (sparse/rate-limited GitHub evidence) to confirm both variants keep the same balanced composition and preserve honest source status.
- Confirmed missing-key and upstream-panel degradation without losing the rest of the report.
- Final Lighthouse mobile run after the complete motion redesign: Performance 97, Accessibility 100, Best Practices 100, SEO 100; LCP 2.6 s, CLS 0, TBT 10 ms.

## Known limitations

- Live Gemini and REST Countries credentials are intentionally absent from the repository; their production smoke tests remain part of deployment verification.
- Google News RSS is a pragmatic free source rather than a contractual API.
- Chromium was exercised directly; Firefox and Safari require manual cross-browser review before submission.
- The repository is public. Vercel deployment and the optional walkthrough video still require their final URLs and account access.

## Time spent

- Documentation audit and implementation plan: ~35 minutes
- Foundation, design system, and layout: ~55 minutes
- Search, orchestration, APIs, and AI fallback: ~75 minutes
- Motion, accessibility, testing, performance, and documentation: ~65 minutes
- Deployment/repository handoff: pending account configuration
