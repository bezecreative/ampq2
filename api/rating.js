/* AMP Industry Insights — email rating capture endpoint.
   The rating page (/rating) fires a client-side POST here; a row is appended to
   the "Ratings" tab of the SAME Google Sheet used by the lead + feedback flows
   (shared service-account auth in _google.js).

   Row: Timestamp | Rating | Subscriber ID | Campaign | User Agent

   Why client-side (not logged on GET): email security scanners — Outlook Safe
   Links, Mimecast, Proofpoint — pre-click every link in a message. They almost
   never run JavaScript, so keeping the write behind a browser fetch filters the
   phantom ratings a server-side GET log would collect (a flat 1–5 from bots that
   hit all five links). See rating-capture-spec.md.

   Env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID
     GOOGLE_RATINGS_TAB   optional, defaults to "Email Rating" — the tab in the sheet
*/
const { appendRow } = require('./_google');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const rating = Number(body?.rating ?? body?.r);
  const sid = String(body?.sid || '').slice(0, 128);
  const campaign = String((body?.campaign ?? body?.c) || '').slice(0, 40);
  /* prefer the browser-reported UA (the anti-scanner signal); fall back to the header */
  const ua = String(body?.ua || req.headers['user-agent'] || '').slice(0, 512);
  const when = new Date().toISOString();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ ok: false });

  try {
    await appendRow(process.env.GOOGLE_RATINGS_TAB || 'Email Rating', [when, rating, sid, campaign, ua]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[rating] sheets append failed:', err?.message || err);
    return res.status(200).json({ ok: false });
  }
};
