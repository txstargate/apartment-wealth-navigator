import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildLeadPayload, submitLead } from '../src/lib/ghl'

test('buildLeadPayload maps fields and routes local for a DC address', () => {
  const payload = buildLeadPayload({
    name: 'Jane Owner',
    email: 'jane@example.com',
    phone: '2025551212',
    location: 'Washington, DC',
    source: 'noi-check',
  })

  expect(payload).toEqual({
    name: 'Jane Owner',
    email: 'jane@example.com',
    phone: '2025551212',
    location: 'Washington, DC',
    source: 'noi-check',
    route: 'local',
  })
})

test('buildLeadPayload routes advisory for an out-of-market address', () => {
  const payload = buildLeadPayload({
    name: 'John Owner',
    email: 'john@example.com',
    phone: '5551234567',
    location: 'Queens, NY',
    source: 'get-started',
  })

  expect(payload.route).toBe('advisory')
})

test('buildLeadPayload routes local for a bare DMV city', () => {
  const payload = buildLeadPayload({
    name: 'Ana Owner',
    email: 'ana@example.com',
    phone: '3015551212',
    location: 'Rockville',
    source: 'noi-check',
  })

  expect(payload.route).toBe('local')
})

const originalFetch = global.fetch
const originalEnv = { ...import.meta.env }

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  global.fetch = originalFetch
  Object.assign(import.meta.env, originalEnv)
})

test('submitLead posts to PUBLIC_GHL_WEBHOOK_URL when set', async () => {
  import.meta.env.PUBLIC_GHL_WEBHOOK_URL = 'https://example.com/webhook'
  const fetchMock = vi.fn().mockResolvedValue({ ok: true })
  global.fetch = fetchMock as unknown as typeof fetch

  const payload = { name: 'Jane', email: 'jane@example.com', phone: '2025551212', location: 'DC', source: 'noi-check', route: 'local' as const }
  await submitLead(payload)

  expect(fetchMock).toHaveBeenCalledWith(
    'https://example.com/webhook',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  )
})

test('submitLead no-ops with a console note when the webhook URL is unset', async () => {
  import.meta.env.PUBLIC_GHL_WEBHOOK_URL = ''
  const fetchMock = vi.fn()
  global.fetch = fetchMock as unknown as typeof fetch
  const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

  const payload = { name: 'Jane', email: 'jane@example.com', phone: '2025551212', location: 'DC', source: 'noi-check', route: 'local' as const }
  await submitLead(payload)

  expect(fetchMock).not.toHaveBeenCalled()
  expect(infoSpy).toHaveBeenCalled()
})
