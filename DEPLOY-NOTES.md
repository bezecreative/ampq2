# AMP Wash Intel · Q2 2026 — Deploy Notes

For the developer taking this live on Vercel. Prepared 2026-07-15 by Beze Creative.

## What this is

A fully static, self-contained report page. One HTML file (all CSS and JS inline), five image assets, one self-hosted font file. No build step, no framework, no dependencies, no package.json needed. A Next.js rebuild is planned for a later quarter; do not start that here.

```
index.html                       the entire site
vercel.json                      headers + config (see below)
images/hero.jpg                  hero cover (also loads with fetchpriority=high)
images/kiosk-attendant.jpg       AMP Spotlight cover
images/team-tablet.jpg           finale cover
images/AMP_Icon_CobaltNavy.svg   favicon
images/og-image.jpg              1200×630 social card
fonts/Manrope-latin-var.woff2    variable font, weights 400-800 (preloaded)
```

## Deploying

1. `vercel deploy` from this directory (or connect it as a repo). Framework preset: **Other / static**. No build command, output directory is the root.
2. The included `vercel.json` sets long immutable caching for `/images/*` and `/fonts/*` and standard caching for the HTML. Image URLs in the HTML carry `?v=2` cache-busters; if you ever replace an image, bump the query string in `index.html` rather than relying on cache purges.
3. Target domain: the team intends this to live at `insights.ampmemberships.com`, which currently serves the OLD Q1 report (a separate Lovable build). Do not delete or overwrite that project until the client confirms cutover; ideally archive it at a subpath or keep its deployment URL reachable.

## REQUIRED before real launch (fine to skip for the client-review deploy)

Grep `TODO` in index.html; there are exactly four, all placeholder destinations:

1. `og:url` and `og:image` in the head: swap the host for the final production URL.
2. Payment-act chip "Start with dunning today": real dashboard dunning deep link (keep the UTM params).
3. Calculator CTA "Start with dunning today →": same real link (keep UTMs).
4. Finale "Schedule a free demo →": real demo-scheduling link (keep UTMs).

## The gate (read this before the client asks)

The report is lead-gated: hero + first section free, everything after sits under a progressive blur with a signup card ("Keep Reading. It's Free.").

- **The gate is presentation, not security.** All content is served to the browser; the blur is CSS. This is understood and accepted for the review/launch phase. Real gating (content only served after a signed cookie from a lead endpoint) is scoped for the Next.js rebuild.
- **The form does not send data anywhere yet.** Submissions validate client-side, unlock the page, and store a remember-me flag in localStorage (`washintel-unlock-q2-2026`). No lead is captured. If the client expects to receive leads during review, that needs an endpoint first; the submit handler is marked with a TODO.
- Remember-me is ON (`const REMEMBER = true` in the gate script). Each device gates once. To demo the gate repeatedly, use a private window or clear that localStorage key.
- A privacy/consent line was cut from the card for design reasons. If captured leads will feed marketing (Kit), legal language likely needs to come back somewhere (report footer works). Flag to Nathan/AMP before real lead capture goes live.

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
