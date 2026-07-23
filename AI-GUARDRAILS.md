# AI Guardrails — binding rules for any AI system working on this page

Prepared 2026-07-23 by MOX (design/build studio of record). This page is a finished, client-approved editorial product. It went through ~70 review comments across two client rounds, a full accessibility/speed/breakpoint audit, and a copy process where individual characters (an em dash, a tilde) were negotiated. **Your job is to change as little as possible.** These rules exist because "small improvements" by well-meaning tools have broken this page before. When any rule conflicts with a task you were given, stop and ask a human — do not resolve the conflict yourself.

## 1. Content is law

- **Never edit copy, numbers, chart values, or data — not even typos.** The copy follows a client-verbatim rule: much of it is the client's own wording, adopted character-for-character (including punctuation you may think is wrong). Apparent "errors" (e.g., "cancelations", an em dash, "about 55%") are deliberate and negotiated. If something looks wrong, flag it to Nathan (MOX); do not fix it.
- Every figure on the page is audited against source workbooks. There is no scenario where you should recompute, round, or "correct" a number.
- The page ships with exactly **3 em dashes**, all client-authored. Do not add em dashes anywhere (house style treats them as a tell of machine-written copy). Do not remove the existing three.
- The removed methodology fine print near the end of the file is preserved in an HTML comment marked "TO RESTORE EXACTLY AS IT WAS". Never delete that comment. If asked to restore it, uncomment it — never retype it.
- Do not resurrect content that was deliberately killed (you may find traces in comments): KPI stat sentences, numbered step circles, DAY 0/3/7 pills, per-chart source lines, the "est." tags, prior headings.

## 2. Layout: full width by default

- **Elements span their container. Never introduce a max-width cap on a section, chart, or card without explicit human direction.** This is a standing rule from the client work ("full-width by default"); several review rounds were spent removing caps that tools had added.
- New content (if ever directed) gets built full-width: a chart that doesn't span its card is wrong until proven otherwise.
- The page column is the `.shell` (1340px cap). That cap and the existing responsive grids are the only sanctioned width constraints.

## 3. Data honesty (non-negotiable)

- **Any geometry that encodes a number must measure exactly.** Bars fill to their printed value (62% fills 62% of its rail). The payment-cliff step draws $10:$30 at exactly 1:3 from a $0 baseline. This is audited; keep it true.
- Never scale, normalize, or exaggerate a mark to "look better". If a real value renders too small to see, the answer is a label, not a taller bar.
- Statistical claims that are stated (the "about 55%" annotation) are stated, not drawn. Do not convert labels into geometry.

## 4. One design system

- Tokens live in `:root`. Use them. No new colors, no new fonts (Manrope only), no new radii or shadows.
- Color is semantic: **blue = good / the thing to look at; grey = decline / loss.** Never use green/red stoplight coding, green ▲ pills, or a "success" green.
- Before creating any new component, find the existing one that owns the job: section headers (`.sec-head`), collapsible insights (`.card-insight` / `.insight-card`), labeled bars (`.lb-row`), chips, the popover system, the dock. New components require human sign-off.
- Banned patterns (removed on sight during reviews): eyebrow micro-labels, uppercase-tracked-label + title stacks, decorative fake charts, three-icon feature rows, aimless anchor buttons. Button labels stay on one line and go somewhere real (UTM-tagged; placeholders carry TODO).

## 5. Motion has rules

- Scroll-driven reveals are **reversible** and **complete by the time the element's center reaches the screen's center**. Nothing "plays once" on scroll except sanctioned one-shot draw-ins.
- No autonomous/looping animation, ever. Pointer-driven states (the cliff scrub, the finale lamp) settle back to a complete static picture the moment the pointer leaves.
- Every animation needs a reason tied to comprehension. "It looks nice" is not a reason.
- `prefers-reduced-motion` paths exist for every motion system; if you touch one, keep its reduced path equivalent and fully-lit.

## 6. Structural invariants (breaking these breaks the product)

- Scrollspy ids `#benchmarks`, `#states`, `#payment`, `#calculator`, `#why-amp` must survive any change; the bottom dock navigates by them.
- The page is ONE self-contained static file: all CSS/JS inline, no build step, no frameworks, no external requests. Per pageview: exactly 3 same-origin asset requests (HTML, font, hero image). **Zero third-party requests is a shipping requirement** (the only sanctioned additions are the form POSTs to AMP's own infrastructure — see FORMS-INTEGRATION.md).
- The gate wraps everything after the hero. Its unlock flow, remember-me key (`washintel-unlock-q2-2026`), and "presentation not security" status are all deliberate.
- localStorage keys in use: `washintel-unlock-q2-2026`, `washintel-fb-q2-2026`, `washintel-share-nudged-q2-2026`. Don't rename them mid-quarter (readers would re-see gates/nudges).
- Calculator math is fixed: monthly at-risk = plans × price × failure rate; recoverable = ~70%; defaults 2,000 / $30 / ~9.0%.

## 7. Verification bar (run after ANY change, before calling it done)

1. Console: zero errors.
2. Breakpoints 375 / 536 / 613 / 824 / 1280 / 1440: no horizontal overflow anywhere (`document.documentElement.scrollWidth <= innerWidth`).
3. Verify with DOM assertions, not screenshots. Two measured gotchas: the finale is scroll-scale-transformed, so measure its children in layout units (`offsetWidth`), not `getBoundingClientRect`; some widgets rebuild their DOM on interaction, so re-query nodes — never assert against held references.
4. Gate: clear the unlock key, confirm lock → fill form → unlock cycle.
5. Mobile: tap targets ≥ ~40px effective, no text under 10px, form inputs ≥16px font (iOS zoom guard).
6. The em-dash count on the rendered page is exactly 3.

## 8. When in doubt

Change nothing visual. The forms task (your first task) requires zero DOM or CSS changes — it is a network call at two marked hook points. If a task seems to require touching layout, copy, motion, or data, it probably doesn't; and if it truly does, that decision belongs to Nathan (MOX) and AMP, not to you.
