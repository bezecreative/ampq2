# AMP Wash Intel · Q2 2026 — Deploy Notes

For the developer taking this live on Vercel. Prepared 2026-07-15 by MOX. **Package v11** (2026-07-23): v10 + a new `/rating` email-rating landing page (`rating.html`) and its `api/rating.js` endpoint writing to the sheet's `Email Rating` tab. **Package v10** (2026-07-23): v9's launch-candidate page + gate lead capture wired (new `api/lead.js`, small addition inside the gate submit handler, new `.vercelignore`). If you already deployed v1–v9, redeploy the whole directory; env vars must be set in Vercel before leads flow (see v10/v11 notes below). (images/team-tablet.jpg and images/kiosk-attendant.jpg are no longer referenced by the page but stay in the bundle for repo parity.)

> **YOUR FIRST TASK after this deploy: wire the two forms (access gate + report feedback) to AMP's internal system. The full spec is in `FORMS-INTEGRATION.md` in this bundle.** And if any AI system touches this codebase, `AI-GUARDRAILS.md` is binding — read it before making any change. These two docs are new in this bundle (11 files total now; they're docs, not deploy assets — exclude them from the public web root if your setup serves .md files).

## What changed in v12 (hero photo swap, 2026-07-23)

1. **New hero photo** (client-supplied, `AMP_Report_Header_V2.jpg`): the AMP app in-hand over coffee. Sourced from a Cloudinary URL and **downloaded/self-hosted** — NOT hotlinked, because zero third-party requests is a shipping requirement (AI-GUARDRAILS §6); the page stays at 3 same-origin requests per pageview.
2. Resized to **2400×1339** — identical to the previous hero, so the `<img width/height>` attributes are unchanged and there is no layout shift. Source was 5504×3072 at the same 1.79 aspect, so no cropping was needed.
3. **Re-encoded to 298KB (from 422KB, −30%)** at JPEG q60; the phone-screen UI detail was checked at 1:1 and holds up clean. This partly addresses the v8 audit's optional note that hero.jpg could re-encode smaller. Per-pageview transfer drops ~124KB.
4. Cache-buster bumped `?v=2` → `?v=3` in index.html (per the deploy rule: bump the query string, don't rely on cache purges).
5. The previous hero is preserved as `images/hero-v1-backup.jpg` — restorable by copying it back over `images/hero.jpg` and bumping the query string again.
6. Existing alt text still describes the new photo accurately ("A wash member reviewing their vehicles in the AMP app over coffee") and was left unchanged. No copy, layout, data, or motion changes. Verified: console clean, no overflow at 375/824/1440, em-dash count still 3.

## What changed in v11 (email rating page, 2026-07-23)

1. **New `/rating` page** (`rating.html`, served at `/rating` via cleanUrls) — the thank-you landing for the 1–5 rating links in the ActiveCampaign follow-up email. Reader clicks a number in the email → lands here → the page confirms their rating ("Thanks — you rated it 4", number injected into `#score`, the 1–5 scale shows their pick in brand blue / the rest grey) and carries the report's share CTAs (copy report link, forward by email). Built from the report's own tokens/Manrope/AMP mark so it reads as the same product. Missing/invalid `r` degrades to a generic thank-you with no broken interpolation and no console errors. `noindex`.
2. **New `api/rating.js`** — appends to the **`Email Rating`** tab of the same Google Sheet (shared `_google.js` auth). Row: `Timestamp | Rating | Subscriber ID | Campaign | User Agent | Comment`. Optional env `GOOGLE_RATINGS_TAB` overrides the tab name (defaults to `Email Rating`). No new Google setup — the existing service account already covers every tab. **Add a `Comment` header in column F of the tab.**
2a. **Optional comment field on `/rating`** (added same day): below the rating confirmation, an optional textarea + "Send comment" button. The rating still logs immediately on click (a click-and-leave reader is captured); the comment is a SECOND write carrying the same rating/sid with the note in column F. Two writes per commenting reader (rating-only row + rating+comment row) — keep the last per subscriber, same analysis rule as before. Own `localStorage` guard (`amp_rating_<campaign>_commented`) so a comment can follow the rating but isn't re-sent on refresh; empty comments don't submit; comment box is hidden for invalid/missing ratings.
3. **Client-side logging, on purpose** (per rating-capture-spec.md): the write is a browser `fetch`, not a server-side GET log, so email security scanners (Outlook Safe Links, Mimecast, Proofpoint) that pre-click every link can't create phantom ratings — they don't run JS. A `localStorage` guard (`amp_rating_<campaign>_logged`) stops refresh double-writes; a genuine re-rate still writes a new row (keep the last per subscriber when analyzing).
4. **Deviation from the spec, by design:** the spec's Piece 1 (Google Apps Script `/exec` endpoint) is NOT used — because this now lives on the report's Vercel deploy, the rating POSTs to same-origin `/api/rating` with the service account we already have. Simpler (no second SHEET_ID / exec URL, no CORS `text/plain` hack) and consistent with the lead + feedback flows.
5. **Email link scheme:** `https://<report-domain>/rating?r=1&sid=%SUBSCRIBERID%&c=2026q2` (…`r=5`…). Fill `REPORT_URL` in `rating.html` with the final report URL before send. HEADS-UP: the spec names host `feedback.ampmembership.com` (singular) but the report site is `ampmemberships.com` (plural) — confirm the canonical host with Nathan before the email goes out.

## What changed in v10 (gate lead capture wired, 2026-07-23)

1. **The access-gate form now captures leads** (Form 1 of FORMS-INTEGRATION.md). On valid submit the page fires a non-blocking, same-origin POST to `/api/lead` (`fetch` with `keepalive`) carrying `{name, email, company, when, report: "q2-2026"}`. The unlock animation never waits on the network; a failed POST still unlocks the report. The email is still NOT persisted in localStorage. Zero DOM/CSS changes; the fulfilled `TODO: fake destination` comment in the gate submit handler was retired (the server-side-gating and og-host TODOs remain, as specced).
2. **New `api/lead.js`** — a Vercel serverless function (zero npm dependencies, no package.json needed) that fans the lead out to (a) a Google Sheet via service-account append and (b) ActiveCampaign via contact sync + tag `AMP_Report_Q2_26`. Credentials live in Vercel env vars: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB` (optional), `AC_API_URL`, `AC_API_KEY`, `AC_COMPANY_FIELD_ID` (optional), `AC_TAG` (optional override). See the header comment in `api/lead.js` for setup.
3. **New `.vercelignore`** keeps the three .md docs out of the public web root (they stay in the GitHub repo).
4. Page asset profile unchanged: still 3 same-origin requests per pageview; the gate's lead POST to `/api/lead` is same-origin and is the sanctioned addition per AI-GUARDRAILS §6.
5. **Form 2 (report feedback) is wired too** — new `api/feedback.js` appends to a separate tab of the SAME Google Sheet (`GOOGLE_FEEDBACK_TAB` env var, default `Feedback` — create that tab). Both spec'd save points POST fire-and-forget: the chip tap sends the rating immediately, Send re-sends with the note. Rows are `when | id | rating | note | stage | report`; the two rows per reader share a per-browser submission id — keep the latest row per id when reading. Submissions are ANONYMOUS per the spec's open identity decision (no email attached until Nathan + AMP decide otherwise). Shared Google auth lives in `api/_google.js` (underscore = not a public endpoint). Feedback TODO markers retired.
6. NOTE (from FORMS-INTEGRATION §Form 1.4): leads now feed marketing automation (ActiveCampaign) — confirm the gate's privacy line satisfies AMP/legal before go-live.

## What changed in v9 (client review round 2, 2026-07-23)

All six changes are client-directed (MarkUp comments #63–68, Drew Earnest / Andrew Clark):

1. Share popup copy → "Share the benchmarks" / "This quarter's industry data and AMP's latest insights."
2. Benchmarks section heading → "Regional YoY Performance"; its sub line → "Jan–Jun 2026 compared to Jan–Jun 2025. Benchmark your sites against regional trends."
3. The benchmarks total-market insight is Andrew Clark's shorter rewrite (East/West outpacing a slight Central dip). The same-site insight is unchanged.
4. The lifecycle Dunning stage body now opens "Automated payment recovery."
5. **The payment-methodology fine print at the page bottom is REMOVED** (client comment #68). It is preserved as an HTML comment in place, marked "TO RESTORE EXACTLY AS IT WAS" — if the client reverses this decision, uncomment that paragraph and redeploy; do not retype it. The NCS wash-count methodology line under the states band stays.
6. No layout, data, or interaction changes in this package; v8's audit results still apply.

## What changed in v8 (payment-cliff redesign + pre-launch audit, 2026-07-22)

1. **The promo payment-cliff chart is redesigned** (stakeholder-directed): the dot plot is replaced by a price step chart over four receipt cards (Jan–Mar $10 paid, Apr $30 "fails more"), with a prose annotation above the line ("The first $30 charge fails about 55% more often."). On hover screens a reading line follows the pointer and highlights the month beneath it; receipts are buttons for touch/keyboard. On phones the annotation moves to an HTML caption below the chart. The step encodes PRICE to a $0 baseline ($10:$30 drawn at exactly 1:3); the 55% figure is stated, never drawn. The card also left its side-by-side pairing and now runs full width. NOTE: the $10/$30 prices are illustrative examples and this card's sub copy is pending a final client pass — flag any client notes on it to Nathan, do not edit.
2. **Dock scrollspy fixed**: jumping via a dock icon (or sitting deep in a long section) no longer leaves the wrong icon lit — the active section is now computed from scroll position.
3. **Copy notes from client review**: hero h1 now reads "The Quarterly State of the Carwash Industry."; the trends region pro-tip says "geographic regions"; the why-fail chart's share bars now fill to their TRUE percentages (62% fills 62% of the rail — a previous round had normalized them).
4. **The calculator CTA has its real destination**: same /get-started/ page as the finale demo button, with its own q2-2026-calculator campaign UTM. Its placeholder TODO is retired.
5. **Mobile**: the payment-lifecycle strip now stacks in ONE column with a vertical spine and node per stage (the sequence was unreadable as a 2-col grid); modal close buttons gained 50px hit areas; the why-fail column headers were bumped above the 10px floor.
6. **Pre-launch audit run (2026-07-22)**: full interaction sweep, breakpoints 375/536/613/824/1280/1440 overflow-clean, gate cycle, calculator math, per-pageview transfer is 3 same-origin requests (~520KB: HTML 64KB gzipped + font 24KB + hero 431KB), no third-party requests, links/UTMs/anchors verified, aria/focus/reduced-motion checks pass. Optional (Nathan's call, not blocking): hero.jpg could re-encode to roughly half its 431KB.

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

Grep `TODO` in index.html; as of v10 there is exactly one launch item (the feedback endpoint was wired in v10 and is no longer on this list):

1. `og:url` and `og:image` in the head: swap the host for the final production URL.

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
