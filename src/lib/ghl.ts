// GoHighLevel lead submission. Pure payload-building plus a thin fetch
// wrapper -- no DOM. Used by /get-started, /contact, and /tools/noi-check.
// See noi-quick-check-spec.md, "GoHighLevel intake contract (set
// 2026-09-12)" and ghl-cowork-runbook.md Part C for the field mappings.

import { routeByLocation } from './geo'

export interface LeadInput {
  name: string
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

function splitName(name: string): { first_name: string; last_name: string } {
  const [first_name = '', ...rest] = name.trim().split(/\s+/)
  return { first_name, last_name: rest.join(' ') }
}

export function buildLeadPayload(input: LeadInput): LeadPayload {
  const { first_name, last_name } = splitName(input.name)
  const route = routeByLocation(input.location) === 'local' ? 'local' : 'advisory'

  const payload: LeadPayload = {
    first_name,
    last_name,
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

export async function submitLead(payload: LeadPayload): Promise<void> {
  const webhookUrl = resolveWebhookUrl(import.meta.env.PUBLIC_GHL_WEBHOOK_URL)

  if (!webhookUrl) {
    console.info('PUBLIC_GHL_WEBHOOK_URL is off -- lead not submitted', payload)
    return
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
