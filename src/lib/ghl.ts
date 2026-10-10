// GoHighLevel lead submission. Pure payload-building plus a thin fetch
// wrapper -- no DOM. Used by /get-started, /contact, and /tools/noi-check.
// See noi-quick-check-spec.md, "GoHighLevel intake contract (set
// 2026-09-12)" and ghl-cowork-runbook.md Part C for the field mappings.

import { routeByLocation } from './geo'

export interface LeadInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  toolName: string
  sourcePage: string
  units?: number
  message?: string
}

export interface LeadPayload {
  first_name: string
  last_name: string
  email: string
  phone: string
  tool_name: string
  property_address: string
  units?: number
  message: string
  route: 'local' | 'advisory'
  source_page: string
}

// First and last name are separate form fields (Shafiq, 2026-09-12) so they
// map one-to-one onto GHL's first_name / last_name without guessing at a split.
export function buildLeadPayload(input: LeadInput): LeadPayload {
  const route = routeByLocation(input.location) === 'local' ? 'local' : 'advisory'

  const payload: LeadPayload = {
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email: input.email,
    phone: input.phone,
    tool_name: input.toolName,
    property_address: input.location,
    message: input.message ?? '',
    route,
    source_page: input.sourcePage,
  }

  if (input.units !== undefined) {
    payload.units = input.units
  }

  return payload
}

// Live inbound webhook for the "NOI Tool Intake — Web" workflow in Shafiq's
// GoHighLevel location yGq2yl5q6YBMPRf0W7j1 (handed over 2026-09-12). It is a
// public endpoint baked into client JS, not a secret. Set
// PUBLIC_GHL_WEBHOOK_URL to override it, or to "off" to disable submission
// (local development, previews).
export const DEFAULT_GHL_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/yGq2yl5q6YBMPRf0W7j1/webhook-trigger/7665ce69-2217-4fb7-84ce-03912b451268'

export function resolveWebhookUrl(envValue?: string): string | null {
  if (envValue === 'off') return null
  return envValue && envValue.trim() !== '' ? envValue : DEFAULT_GHL_WEBHOOK_URL
}

// Same-origin serverless function (api/route-lead.js, added 2026-10-10). It
// forwards the lead to the webhook above and enrolls the contact in its
// program's published GHL sequence. Live leads go through it; if it fails or
// did not forward, the browser posts to the webhook directly so no lead is lost.
export const ROUTE_LEAD_ENDPOINT = '/api/route-lead'

async function routedThroughFunction(body: string): Promise<boolean> {
  try {
    const r = await fetch(ROUTE_LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    if (!r.ok) return false
    const j = await r.json()
    return j?.forwarded === true
  } catch {
    return false
  }
}

export async function submitLead(payload: LeadPayload): Promise<void> {
  const webhookUrl = resolveWebhookUrl(import.meta.env.PUBLIC_GHL_WEBHOOK_URL)

  if (!webhookUrl) {
    console.info('PUBLIC_GHL_WEBHOOK_URL is off -- lead not submitted', payload)
    return
  }

  const body = JSON.stringify(payload)
  if (webhookUrl === DEFAULT_GHL_WEBHOOK_URL && (await routedThroughFunction(body))) return

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
