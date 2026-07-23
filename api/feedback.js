/* AMP Wash Intel Q2 2026 — report-feedback endpoint (Form 2 of FORMS-INTEGRATION.md).
   Receives the finale rating row's fire-and-forget POSTs and appends each to a
   Google Sheet tab. ANONYMOUS by design: per the handoff spec, whether feedback
   attaches the reader's gate identity is an open decision (Nathan + AMP) — until
   decided, no email or name is accepted or stored here.

   Two POSTs per reader are expected (both save points): the chip tap sends the
   rating immediately (stage "rating"), Send re-sends with the note (stage
   "rating+note"). Both rows share a per-browser submission id — keep the latest
   row per id when reading the sheet.

   Row: when | id | rating | note | stage | report

   Env vars (same Google service account as api/lead.js):
     GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID
     GOOGLE_FEEDBACK_TAB   optional, defaults to "Feedback" — create this tab in the sheet
*/
const { appendRow } = require('./_google');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const rating = Number(body?.r);
  const id = String(body?.id || '').slice(0, 64);
  const note = String(body?.note || '').slice(0, 2000);
  const when = String(body?.when || new Date().toISOString()).slice(0, 40);
  const report = String(body?.report || 'q2-2026').slice(0, 40);
  const stage = note ? 'rating+note' : 'rating';

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ ok: false });

  try {
    await appendRow(process.env.GOOGLE_FEEDBACK_TAB || 'Feedback', [when, id, rating, note, stage, report]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[feedback] sheets append failed:', err?.message || err);
    return res.status(200).json({ ok: false });
  }
};
