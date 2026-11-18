// Monthly Navigator Report email signup. Pure payload-building plus a thin
// fetch wrapper, no DOM. It posts to its OWN GHL inbound webhook, never the
// NOI Tool Intake one in ghl.ts, so a report subscriber does not enter the
// NOI audit email series. The signup box renders only when
// PUBLIC_GHL_REPORT_WEBHOOK_URL is set (see ReportSignup.astro).

export type BuildingSize = '3-4' | '5-20'

export interface ReportSignupInput {
  firstName: string
  email: string
  buildingSize: string
  sourcePage: string
}

export interface ReportSignupPayload {
  first_name: string
  email: string
  building_size: BuildingSize
  tool_name: string
  source_page: string
  tags: string[]
}

export function isBuildingSize(value: string): value is BuildingSize {
  return value === '3-4' || value === '5-20'
}

export function buildReportSignupPayload(input: ReportSignupInput): ReportSignupPayload {
  if (!isBuildingSize(input.buildingSize)) {
    throw new Error(`Unknown building size: ${input.buildingSize}`)
  }
  return {
    first_name: input.firstName.trim(),
    email: input.email.trim(),
    building_size: input.buildingSize,
    tool_name: 'Navigator Report',
    source_page: input.sourcePage,
    tags: ['navigator-report', `navigator-report-${input.buildingSize}`],
  }
}

// Returns null when the env value is missing or "off", which hides the box.
export function resolveReportWebhookUrl(envValue?: string): string | null {
  const v = envValue?.trim()
  return v && v !== 'off' ? v : null
}

export async function submitReportSignup(url: string, payload: ReportSignupPayload): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Report signup failed with status ${response.status}`)
  }
}
