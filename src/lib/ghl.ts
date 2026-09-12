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

export async function submitLead(payload: LeadPayload): Promise<void> {
  const webhookUrl = import.meta.env.PUBLIC_GHL_WEBHOOK_URL

  if (!webhookUrl) {
    // TODO-Shafiq: set PUBLIC_GHL_WEBHOOK_URL to the real GoHighLevel
    // inbound webhook once it exists (ghl-cowork-runbook.md Part C).
    console.info('PUBLIC_GHL_WEBHOOK_URL is unset -- lead not submitted', payload)
    return
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
