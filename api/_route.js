// Lead routing for apartmentwealthnavigator.com (built 2026-10-10).
// Every site form posts here through /api/route-lead. Step 1 forwards the lead
// to the GHL intake webhook unchanged, so the "NOI Tool Intake - Web" workflow
// keeps creating the contact, tag and opportunity exactly as before. Step 2
// enrolls the contact in its program's email sequence through the GHL API,
// but only when that sequence is published. GHL's API cannot publish or edit
// workflows (read-only), so publishing stays a GHL UI step.
//
// The PIT token lives in Vercel env vars (GHL_PIT_TOKEN, GHL_LOCATION_ID),
// never in the browser. Without them the function forwards only.

const GHL = 'https://services.leadconnectorhq.com'
const VERSION = '2021-07-28'

export const DEFAULT_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/yGq2yl5q6YBMPRf0W7j1/webhook-trigger/7665ce69-2217-4fb7-84ce-03912b451268'

// tool_name sent by each Navigator page -> GHL sequence workflow id.
// Read from GET /workflows on 2026-10-10.
export const PROGRAM_WORKFLOWS = {
  'NOI Navigator': 'a3ea39e5-a1ef-4043-a3c5-b275e5e20ec6', // NOI Email and Text Sequences
  'Refinance Navigator': 'e26ce09f-9a1f-4823-89c9-e904597b9047', // Email sequence for the Refinance Readiness Campaign
  'Exit Navigator': 'c5b74198-8c28-4547-88ab-46f148f9481a', // SELLER RAMP B (Sale Readiness Scorecard Funnel)
  'Value Navigator': '9eca2bdc-fc07-4c1c-9515-a73c0a3739e7', // Email and Text sequence for What's Your Apartment Building Worth
}

function str(v) {
  return v === undefined || v === null ? '' : String(v).trim()
}

function done(forwarded, enrolled, reason) {
  const body = { ok: true, forwarded, enrolled }
  if (reason) body.reason = reason
  return { status: 200, body }
}

export async function routeLead({ payload, env, fetchImpl }) {
  if (!payload || typeof payload !== 'object' || (!str(payload.email) && !str(payload.phone))) {
    return { status: 400, body: { ok: false, error: 'email or phone required' } }
  }

  let forwarded = false
  try {
    const r = await fetchImpl(env.GHL_WEBHOOK_URL || DEFAULT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    forwarded = r.ok
  } catch {
    forwarded = false
  }

  const workflowId = PROGRAM_WORKFLOWS[str(payload.tool_name)]
  if (!workflowId) return done(forwarded, false, 'no-program')

  const token = env.GHL_PIT_TOKEN
  const locationId = env.GHL_LOCATION_ID
  if (!token || !locationId) return done(forwarded, false, 'not-configured')

  const headers = { Authorization: 'Bearer ' + token, Version: VERSION, 'Content-Type': 'application/json' }

  try {
    const r = await fetchImpl(GHL + '/workflows/?locationId=' + encodeURIComponent(locationId), { headers })
    const j = await r.json()
    const wf = (j.workflows || []).find((w) => w.id === workflowId)
    if (!wf || wf.status !== 'published') return done(forwarded, false, 'workflow-not-published')
  } catch {
    return done(forwarded, false, 'workflow-check-failed')
  }

  let contactId = null
  try {
    const body = { locationId, firstName: str(payload.first_name), lastName: str(payload.last_name) }
    if (str(payload.email)) body.email = str(payload.email)
    if (str(payload.phone)) body.phone = str(payload.phone)
    const r = await fetchImpl(GHL + '/contacts/upsert', { method: 'POST', headers, body: JSON.stringify(body) })
    const j = await r.json().catch(() => ({}))
    contactId = r.ok && j.contact ? j.contact.id : null
  } catch {
    contactId = null
  }
  if (!contactId) return done(forwarded, false, 'upsert-failed')

  try {
    const r = await fetchImpl(GHL + '/contacts/' + contactId + '/workflow/' + workflowId, {
      method: 'POST',
      headers,
      body: '{}',
    })
    if (!r.ok) return done(forwarded, false, 'enroll-failed')
  } catch {
    return done(forwarded, false, 'enroll-failed')
  }

  return done(forwarded, true)
}
