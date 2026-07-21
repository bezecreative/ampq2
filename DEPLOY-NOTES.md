# AMP Wash Intel · Q2 2026 — Deploy Notes

For the developer taking this live on Vercel. Prepared 2026-07-15 by MOX. **Package v7** (2026-07-21): if you already deployed v1–v6, redeploy with this index.html; nothing else in the bundle changed (images/team-tablet.jpg and images/kiosk-attendant.jpg are no longer referenced by the page but stay in the bundle for repo parity).

## What changed in v7 (client markup round + motion covers + feedback, 2026-07-21)

1. **Client review comments applied (app.markup.io round, client-authored copy):** hero sub now says "millions of member recharges" (Matt); the AMP cover intro is Patrick's broader-audience rewrite ("Some member cancellations were never a choice..."); the why-fail insight is Laura's clearer retry-programs rewrite; the calculator section head is Laura's "How Much of My Revenue Is at Risk?"; the last "AMP Insight" tag reads "Insight"; the Wash Intel hero lockup and the methodology foot split are per client notes. If review notes flag copy that differs from package v6, these client edits are why; do not revert.
2. **Layout notes from the same round:** long section intros and chart descriptions now span the full column (width caps removed site-wide); the why-fail chart shows values to the LEFT of its bars with share bars normalized to the chart's own scale; a "New - AMP MCP" capability callout sits in the finale between the stats and the CTAs.
3. **The AMP act cover is redesigned ("the rite"):** the kiosk photo cover is gone; it is now a centered near-black plaque with a scroll-driven sunrise glow (reversible, reduced-motion gets the resting state). This removed the page's use of kiosk-attendant.jpg.
4. **The payment-lifecycle strip is scroll-driven ("the scrub"):** the chevrons are replaced by one continuous rail whose stages wake as you scroll (complete by screen center); on hover devices the payment dot can be scrubbed with the pointer. Phone gets a fully lit stack; no-JS and reduced-motion get the full lit rail.
5. **The trends card:** slimmer region lines with right-gutter labels (labels can no longer collide with lines), and the per-view Pro tip now lives inside the insight aside instead of a separate chip.
6. **NEW: report-feedback row ("the last beat")** at the bottom of the finale plaque: a 1-5 "how useful was this report?" chip scale; the tap records the rating, an optional note field opens after. **The rating currently stores ONLY in the reader's localStorage (`washintel-fb-q2-2026`) — there is no endpoint. Nothing is collected until one exists** (see TODOs); one submission per browser, returning readers see a thank-you row. Feedback copy is pending a final client pass.
7. **The finale demo CTA now has its real destination** (ampmemberships.com/get-started with UTMs); its placeholder TODO is retired. TODO count is 8 lines: 4 placeholder-destination markers (3 launch items, the feedback endpoint carries 2 markers) + 4 marking the server-side-gating placeholder.

## What changed in v6 (client-verbatim payment act rewrap, 2026-07-20)

1. **The AMP payment act now follows the client's own revised section file VERBATIM** in structure, copy, and data (the client file is the content authority; the house design system is the wrapper). New order: cover -> payment-failure-and-recovery flow -> why payments fail -> card-type + promo-cliff pair -> "Failed Payment Recovery Strategies" -> recovery curve -> retry-schedule insight -> "Win-Back: The Boomerang Effect" with two paired charts -> calculator. If review notes say the copy differs from earlier packages, this is why; do not revert wording.
2. **Removed with the rewrap** (all client-instructed): the 9.3/62.9/$7 KPI sentence, the "5 out of 6" act break, the 31% first-text stat section AND its "View the data" appendix modal, the lifecycle Pro-tip and two-layers popovers, the DAY 0/3/7 pills on the recovery curve, all chart source/cohort lines, and the est. tags in the flow.
3. **The calculator is the client's model now**: monthly at-risk = active plans x average price x failure rate, ~70% assumed recoverable, defaults 2,000 / $30 / ~9.0%, with an "Apply savings" switch inside the recoverable box (shows the residual at-risk) and a new CTA "Contact AMP to get started ->" (placeholder link, see TODOs). The dunning toggle, 100-dot grid, presets, yearly framing, and both "Start with dunning today" links are gone.
4. The recovery curve sizes its drawing to the card width at render time (re-fits on resize); paired chart cards bottom-anchor their insight boxes so the chips align.
5. TODO count is 7 lines: 3 placeholder destinations (listed below) + 4 marking the server-side-gating placeholder.

## What changed in v5 (new verified data grain + finale redesign, 2026-07-17)

1. **The payment numbers moved to a new measurement grain**, verified against the client's own figures workbook (fresh Snowflake export: first charge attempt per payment, Jul 2025 - Jun 2026): blended failure is now **9.3% (1 in 11)**, total recovery **62.9%**, prepaid fails **15x** credit (was 16x), card-type shown as credit 1x / debit 3x with volume shares. The $7/member/yr foothold is unchanged (recomputes to ~3.45% never collected). Hero, meta description, methodology foot, and the data-appendix modal all carry the new grain and the Jul 2025 - Jun 2026 window.
2. **Payment act copy pass** (client's v6 revisions, adopted after review): warmer cover intro; a new 5-stage recovery-lifecycle strip (its prevent/retries/dunning figures are the client's own illustrative estimates and carry visible "est." tags); They-Come-Back shown as relatives (~2x / ~1.8x / ~1.7x over baseline); the cancel-reason chart simplified to 6 qualitative buckets; the price-change card reframed as the promo cliff (baseline / +55%); recovery curve normalized to day 14 = 100% of recoveries (DAY 0/3/7 markers kept); the recovery waterfall card removed (still in source as a comment, trivially restorable); the operator mandate rebuilt as a headline + four-action grid.
3. **The finale is redesigned**: the photo cover is gone; it is now a near-black plaque whose card scales/sharpens/brightens bound to scroll, with a cursor-following light that grows as the pointer nears the demo CTA and floods the card over it. Touch and reduced-motion devices get a static lamp; no-JS gets a fully lit static card. This removed the finale's use of team-tablet.jpg.
4. **Calculator**: default failure rate is the new 9.3%; the recovery mechanics intentionally stay on the measured 59%/63% (a client question about a higher assumed rate is still open - do not "fix" this).
5. Numbers audit rerun for every changed figure against `Q2_2026_Payment_Health_Figures.xlsx`. TODO count in index.html is unchanged (same 8 lines).

## What changed in v4 (Payment Health five-act rebuild)

The gated Payment Health section was restructured per the client design brief so it reads as an argument instead of a gallery. Same design system, same data, new order and three new charts:

1. **Act order is now:** cover ("The Members Who Didn't Choose to Leave") → KPI flow (8.3% → 59% → 3.4%) → They Come Back + why-they-left boomerang chart → diagnosis (why payments fail, card-type risk, price changes) → recovery curve → waterfall + calculator → operator mandate. The dunning product is not mentioned until the recovery section, by design.
2. **New charts:** the KPI flow card, the 8-bucket cancel-reason chart (307,047-cancel cohort, counts shown per bucket), the featured "Why payments fail" dual bars, and the card-type trio (52/11/3). All previously appendix-only or absent; every figure validated against AMP's CSVs.
3. **Recovery-curve markers** are now day-labeled (DAY 0 / DAY 3 / DAY 7) instead of TEXT 1/2/3.
4. **New closing card** ("Turn Recovery On Before You Need It.") between the calculator and the finale.
5. The methodology footnote consolidates the reachability, day-14, and cancel-reason caveats.
6. **2026-07-17 client-meeting alignment (same v4 package, refreshed before it shipped):** the third KPI leads with $7/member/yr (Nathan's "foothold" call from the 07-16 meeting), the three AMP-act insight boxes now stack UNDER their charts instead of sitting beside them (Andrew's ask), the recovery section heading names the layers plainly ("Two Layers of Recovery: Retries, Then Texts") with dunning defined at first use, and the AMP cover intro is larger/brighter.

TODO count in index.html is unchanged (same 8 lines: 4 swap destinations, 4 marking the server-side-gating placeholder).

## What changed in v3 (rendering-glitch fix)

One CSS addition: after the lead gate unlocks and settles, its four full-page progressive-blur layers are now removed from rendering (`display: none`) instead of idling at `blur(0px)`. `blur(0px)` still counts as an active backdrop-filter, so every unlocked pageview was compositing the entire document through four stacked filter surfaces. This is the suspected cause of the band-shaped paint dropouts Nathan saw while screen-recording on 2026-07-15 (partially blank state map, half-empty calculator card). It is also a straight GPU/battery win on mobile. The gate's melt animation is unchanged.

## What changed in v2 (client review round 1 response)

1. **Two new chart sections** in the gated region, between the calculator and the closing CTA: "When prices change, payments fail more often" and "They come back, and fast." Their data is validated against AMP's v4 source files.
2. **A privacy line on the gate popup**, linking to https://ampmemberships.com/privacy-policy/ (opens in a new tab). This is the only external link the gate has; the page still makes zero third-party *requests* (fonts and assets stay same-origin).
3. Heads-up for client feedback routing: the client's reference mockups are an OLD superseded spec with different numbers (e.g. 23.1% and "nearly 3×" where the live page correctly says 12.2% and +55%). If review notes claim the new charts' numbers are wrong, route to Nathan; do not change figures.

## What this is

A fully static, self-contained report page. One HTML file (all CSS and JS inline), five image assets, one self-hosted font file. No build step, no framework, no dependencies, no package.json needed. A Next.js rebuild is planned for a later quarter; do not start that here.

```
index.html                       the entire site
vercel.json                      headers + config (see below)
images/hero.jpg                  hero cover (also loads with fetchpriority=high)
images/kiosk-attendant.jpg       AMP Spotlight cover
images/team-tablet.jpg           unused as of v5 (was the finale cover); kept for repo parity
images/AMP_Icon_CobaltNavy.svg   favicon
images/og-image.jpg              1200×630 social card
fonts/Manrope-latin-var.woff2    variable font, weights 400-800 (preloaded)
```

## Deploying

1. `vercel deploy` from this directory (or connect it as a repo). Framework preset: **Other / static**. No build command, output directory is the root.
2. The included `vercel.json` sets long immutable caching for `/images/*` and `/fonts/*` and standard caching for the HTML. Image URLs in the HTML carry `?v=2` cache-busters; if you ever replace an image, bump the query string in `index.html` rather than relying on cache purges.
3. Target domain: the team intends this to live at `insights.ampmemberships.com`, which currently serves the OLD Q1 report (a separate Lovable build). Do not delete or overwrite that project until the client confirms cutover; ideally archive it at a subpath or keep its deployment URL reachable.

## REQUIRED before real launch (fine to skip for the client-review deploy)

Grep `TODO` in index.html; there are exactly three launch items (the finale demo link got its real destination in v7 and is no longer on this list):

1. `og:url` and `og:image` in the head: swap the host for the final production URL.
2. Calculator CTA "Contact AMP to get started →": real contact / get-started link (keep the UTM params).
3. **Feedback endpoint** for the finale's rating row (two TODO markers, one in the HTML and one in the `lastBeat` script): POST the rating at the chip tap and the note at Send. Until this exists the ratings live only in each reader's localStorage and nothing reaches AMP. Decide with Nathan whether submissions attach the gate email or stay anonymous.

## The gate (read this before the client asks)

The report is lead-gated: hero + first section free, everything after sits under a progressive blur with a signup card ("Keep Reading. It's Free.").

- **The gate is presentation, not security.** All content is served to the browser; the blur is CSS. This is understood and accepted for the review/launch phase. Real gating (content only served after a signed cookie from a lead endpoint) is scoped for the Next.js rebuild.
- **The form does not send data anywhere yet.** Submissions validate client-side, unlock the page, and store a remember-me flag in localStorage (`washintel-unlock-q2-2026`). No lead is captured. If the client expects to receive leads during review, that needs an endpoint first; the submit handler is marked with a TODO.
- Remember-me is ON (`const REMEMBER = true` in the gate script). Each device gates once. To demo the gate repeatedly, use a private window or clear that localStorage key.
- The card carries a short privacy line linking to ampmemberships.com/privacy-policy (added in v2). If captured leads will feed marketing (Kit), confirm that language satisfies legal before real lead capture goes live; flag to Nathan/AMP.

## Numbers are audited — do not edit copy

Every figure on the page was verified against NCS/AMP source data (2026-07-14), and the copy follows strict client compliance rules (no portfolio dollar totals, observational language, a specific banned figure). Do not tweak numbers or reword copy during deploy. If something looks wrong, flag it to Nathan instead.

## Post-deploy checklist

- Run Lighthouse against the live URL (expect strong scores; the page is ~1.1MB total, mostly the three JPEGs).
- Check the social card with an unfurl debugger (og tags are set; the image is `/images/og-image.jpg`).
- Real-device pass that local testing could not cover: iPhone safe-areas (the bottom dock), the gate blur's GPU cost on mobile Safari, hover tooltips on touch, and a VoiceOver + keyboard sanity pass.
- Analytics: the page ships with NONE (outbound CTAs are UTM-tagged, but nothing measures the report itself). Decide with Nathan whether to add Vercel Analytics or similar; nothing is wired for it yet.
- Fonts, images, and everything else are same-origin: there should be zero third-party requests. If you see any, something is wrong.

## Contact

Design/build questions: Nathan (Beze Creative). Client stakeholder: Patrick Conium (NCS), via Nathan. The full working history lives in the project's HANDOFF.md (not included here).
