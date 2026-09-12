// GoHighLevel lead submission. Pure payload-building plus a thin fetch
// wrapper -- no DOM. Used by /get-started and /tools/noi-check. See
// noi-quick-check-spec.md (lead capture) and build-plan.md Task 14/19.

import { routeByLocation } from './geo'

export interface LeadInput {
  name: string
  email: string
  phone: string
  location: string
  source: string
}

export interface LeadPayload extends LeadInput {
  route: 'local' | 'advisory'
}

export function buildLeadPayload(input: LeadInput): LeadPayload {
  const route = routeByLocation(input.location) === 'local' ? 'local' : 'advisory'
  return { ...input, route }
}

export async function submitLead(payload: LeadPayload): Promise<void> {
  const webhookUrl = import.meta.env.PUBLIC_GHL_WEBHOOK_URL

  if (!webhookUrl) {
    // TODO-Shafiq: set PUBLIC_GHL_WEBHOOK_URL to the real GoHighLevel
    // inbound webhook once it exists (build-plan.md Task 14).
    console.info('PUBLIC_GHL_WEBHOOK_URL is unset -- lead not submitted', payload)
    return
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
