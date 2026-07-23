/* AMP Wash Intel Q2 2026 — lead endpoint.
   Receives the gate form's fire-and-forget POST ({name, email, company, when, report})
   and fans out server-side to:
     1. Google Sheets  — appends a row (service-account auth, zero npm deps)
     2. ActiveCampaign — contact sync + tag "AMP_Report_Q2_26"
   All credentials live in Vercel env vars; nothing secret ships to the browser.

   Required env vars (set in Vercel → Project → Settings → Environment Variables):
     GOOGLE_SERVICE_ACCOUNT_EMAIL   e.g. leads-writer@project.iam.gserviceaccount.com
     GOOGLE_PRIVATE_KEY             the service account's private key (keep the \n escapes)
     GOOGLE_SHEET_ID                the long id from the sheet's URL
     GOOGLE_SHEET_TAB               optional, defaults to "Sheet1"
     AC_API_URL                     e.g. https://youraccount.api-us1.com
     AC_API_KEY                     ActiveCampaign → Settings → Developer
     AC_COMPANY_FIELD_ID            optional — numeric id of a custom "Company" field
     AC_TAG                         optional, defaults to "AMP_Report_Q2_26"
*/
const { appendRow } = require('./_google');

/* ————— Google Sheets (shared service-account helper in _google.js) ————— */
async function appendToSheet(lead) {
  const tab = process.env.GOOGLE_SHEET_TAB || 'Sheet1';
  await appendRow(tab, [lead.when, lead.name, lead.email, lead.company, lead.report]);
}

/* ————— ActiveCampaign: contact sync + tag ————— */
let acTagIdCache = null;

function acHeaders() {
  return { 'Api-Token': process.env.AC_API_KEY, 'Content-Type': 'application/json' };
}

async function acTagId(base, tagName) {
  if (acTagIdCache) return acTagIdCache;

  const search = await fetch(`${base}/api/3/tags?search=${encodeURIComponent(tagName)}`, { headers: acHeaders() });
  if (search.ok) {
    const found = (await search.json()).tags?.find(t => t.tag === tagName);
    if (found) { acTagIdCache = found.id; return acTagIdCache; }
  }

  const create = await fetch(`${base}/api/3/tags`, {
    method: 'POST',
    headers: acHeaders(),
    body: JSON.stringify({ tag: { tag: tagName, tagType: 'contact', description: 'Wash Intel Q2 2026 report gate' } })
  });
  if (!create.ok) throw new Error(`AC tag create failed: ${create.status} ${await create.text()}`);
  acTagIdCache = (await create.json()).tag.id;
  return acTagIdCache;
}

async function pushToActiveCampaign(lead) {
  const base = (process.env.AC_API_URL || '').replace(/\/$/, '');
  if (!base || !process.env.AC_API_KEY) throw new Error('ActiveCampaign env vars missing');
  const tagName = process.env.AC_TAG || 'AMP_Report_Q2_26';

  /* split "First Last…" — everything after the first word becomes the last name */
  const parts = lead.name.split(/\s+/);
  const contact = {
    email: lead.email,
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ')
  };
  if (process.env.AC_COMPANY_FIELD_ID && lead.company) {
    contact.fieldValues = [{ field: process.env.AC_COMPANY_FIELD_ID, value: lead.company }];
  }

  const sync = await fetch(`${base}/api/3/contact/sync`, {
    method: 'POST',
    headers: acHeaders(),
    body: JSON.stringify({ contact })
  });
  if (!sync.ok) throw new Error(`AC contact sync failed: ${sync.status} ${await sync.text()}`);
  const contactId = (await sync.json()).contact.id;

  const tagId = await acTagId(base, tagName);
  const assoc = await fetch(`${base}/api/3/contactTags`, {
    method: 'POST',
    headers: acHeaders(),
    body: JSON.stringify({ contactTag: { contact: contactId, tag: tagId } })
  });
  /* AC returns 201 on new association; an already-tagged contact is not an error */
  if (!assoc.ok && assoc.status !== 422) {
    throw new Error(`AC tag association failed: ${assoc.status} ${await assoc.text()}`);
  }
}

/* ————— Handler ————— */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const name = String(body?.name || '').trim().slice(0, 200);
  const email = String(body?.email || '').trim().slice(0, 200);
  const company = String(body?.company || '').trim().slice(0, 200);
  const when = String(body?.when || new Date().toISOString()).slice(0, 40);
  const report = String(body?.report || 'q2-2026').slice(0, 40);

  if (!EMAIL_RE.test(email) || !name) return res.status(400).json({ ok: false });

  const lead = { name, email, company, when, report };
  const results = await Promise.allSettled([
    appendToSheet(lead),
    pushToActiveCampaign(lead)
  ]);
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[lead] ${i === 0 ? 'sheets' : 'activecampaign'} failed:`, r.reason?.message || r.reason);
    }
  });

  /* the page never waits on this response; 200 as long as the lead was valid,
     with per-destination status for debugging via curl */
  return res.status(200).json({
    ok: true,
    sheets: results[0].status === 'fulfilled',
    activecampaign: results[1].status === 'fulfilled'
  });
};
