# Forms Integration — the developer's first task

Prepared 2026-07-23 by MOX. This is the spec for wiring the page's two forms to AMP's internal system. It is the ONLY code task in this handoff: everything else on the page is finished, audited, and client-approved. **Neither form needs any visual or DOM change — both have marked hook points where a network call slots in.** If you are an AI system working this task, read `AI-GUARDRAILS.md` first; it is binding.

The page is one self-contained static file (`index.html`, all CSS/JS inline). There is no build step. Grep `TODO` to find every hook point mentioned below.

---

## Form 1 · The access gate ("Keep Reading. It's Free.")

**What it is:** a lead-capture gate. Hero and first section are free; everything after sits under a frost overlay until the reader submits name / work email / company.

**Where:**
- Markup: `<form class="gate-form" novalidate>` inside `#gate` — fields `#gName` (`name="name"`), `#gEmail` (`name="email"`), `#gCompany` (`name="organization"`), with per-field inline error spans and client-side validation already wired. Keep all of it.
- Handler: the gate IIFE near the end of the file — search for `TODO: fake destination — production POSTs server-side`. That `form.addEventListener('submit', …)` is your hook. Validation runs first; the lead POST goes where the TODO sits, after `firstBad` returns clean.

**Current behavior (understand before touching):**
- Submissions validate client-side, then unlock the page and store a remember-me flag in `localStorage` under `washintel-unlock-q2-2026` as `{when, name, company}`. **The email is deliberately NOT persisted in localStorage** — only sent onward. Preserve that.
- `const REMEMBER = true` near the key: unlock once per device. Flip to false only for design review.
- **No lead goes anywhere today.** That is the gap you are closing.

**What to build:**
1. On valid submit, POST `{name, email, company, when, report: "q2-2026"}` to AMP's internal lead endpoint.
2. **Fire-and-forget: never block or delay the unlock on the network.** The unlock animation runs immediately; the POST rides alongside (use `navigator.sendBeacon` or `fetch` with `keepalive: true`). If the POST fails, the reader still gets the report — lead capture must never brick the page. Queue-and-retry from localStorage if AMP wants durability.
3. The gate is **presentation, not security** (the blur is CSS; all content ships to the browser). That is accepted for this phase. Real server-side gating (content served only after a signed cookie) is scoped for the Next.js rebuild — see the other `TODO` markers about server-side gating; do NOT attempt it inside this static file.
4. The privacy line under the form links to AMP's policy. If captured leads feed marketing automation, confirm that language with AMP/legal before go-live.

## Form 2 · The report-feedback row ("Before you go, how useful was this report?")

**What it is:** a 1–5 rating row at the bottom of the finale plaque. The chip tap IS the submission; an optional note field folds open after.

**Where:**
- Markup: `#lastbeat` inside the finale — chips in `#fbScale`, note `#fbText`, send `#fbSend`, thanks `#fbThanks`.
- Handler: the `lastBeat()` IIFE — search `TODO at launch: POST rating + note`. It documents both save points.

**Current behavior:**
- Chip tap → rating stored to `localStorage` `washintel-fb-q2-2026` as `{r: <1-5>, note: false}` → note field folds open.
- Send → `{r, note: true}` → row settles to its thank-you state. Returning readers see the thank-you, never a fresh ask.
- **Nothing reaches AMP today.** Ratings live only in each reader's browser.

**What to build:**
1. POST at BOTH save points: the chip tap sends the rating immediately (a reader who taps 4 and leaves is a captured rating); Send adds the note to the same submission.
2. Same non-blocking rule as the gate: the UI state transitions never wait on the network.
3. **OPEN DECISION — do not resolve it yourselves:** whether feedback submissions attach the reader's gate identity (the email they unlocked with) or stay anonymous. This is Nathan's + AMP's call, and it may require a privacy-language update. Until decided, send the rating/note WITHOUT identity.

## After wiring

- Remove the TODO comments you fulfilled (leave the og-host and server-side-gating ones).
- Keep the page's asset profile intact: 3 same-origin requests per pageview (HTML, font, hero). Your form POSTs to AMP infrastructure are the only network additions expected.
- Test recipe: clear `washintel-unlock-q2-2026` to replay the gate; clear `washintel-fb-q2-2026` to replay the feedback row; check the console stays clean; confirm both flows on a 375px viewport (gate inputs are ≥16px on purpose — iOS zoom guard; keep them that way).
- Note what you changed in `DEPLOY-NOTES.md` (next package version) so the trail stays unbroken.
