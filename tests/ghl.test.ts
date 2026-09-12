import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildLeadPayload, submitLead } from '../src/lib/ghl'

test('buildLeadPayload splits the name and maps every field for the NOI tool', () => {
  const payload = buildLeadPayload({
    name: 'Jane Owner',
    email: 'jane@example.com',
    phone: '2025551212',
    location: 'Washington, DC',
    toolName: 'NOI Leak Audit',
    sourcePage: '/tools/noi-check',
    units: 12,
    message: 'Refinancing in Q1, expenses climbing',
  })

  expect(payload).toEqual({
    first_name: 'Jane',
    last_name: 'Owner',
    email: 'jane@example.com',
    phone: '2025551212',
    tool_name: 'NOI Leak Audit',
    property_address: 'Washington, DC',
    units: 12,
    message: 'Refinancing in Q1, expenses climbing',
    route: 'local',
    source_page: '/tools/noi-check',
  })
})

test('buildLeadPayload splits a multi-word last name into the remainder', () => {
  const payload = buildLeadPayload({
    name: 'Ana Maria Gutierrez',
    email: 'ana@example.com',
    phone: '3015551212',
    location: 'Rockville',
    toolName: 'Get a Read',
    sourcePage: '/get-started',
  })

  expect(payload.first_name).toBe('Ana')
  expect(payload.last_name).toBe('Maria Gutierrez')
})

test('buildLeadPayload leaves last_name empty for a single-token name', () => {
  const payload = buildLeadPayload({
    name: 'Cher',
    email: 'cher@example.com',
    phone: '2025551212',
    location: 'Washington, DC',
    toolName: 'Get a Read',
    sourcePage: '/contact',
  })

  expect(payload.first_name).toBe('Cher')
  expect(payload.last_name).toBe('')
})

test('buildLeadPayload routes advisory for an out-of-market address', () => {
  const payload = buildLeadPayload({
    name: 'John Owner',
    email: 'john@example.com',
    phone: '5551234567',
    location: 'Queens, NY',
    toolName: 'Get a Read',
    sourcePage: '/get-started',
  })

  expect(payload.route).toBe('advisory')
})

test('buildLeadPayload omits units on forms without it', () => {
  const payload = buildLeadPayload({
    name: 'Jane Owner',
    email: 'jane@example.com',
    phone: '2025551212',
    location: 'Washington, DC',
    toolName: 'Get a Read',
    sourcePage: '/get-started',
  })

  expect(payload).not.toHaveProperty('units')
  expect(Object.keys(payload).sort()).toEqual(
    ['email', 'first_name', 'last_name', 'message', 'phone', 'property_address', 'route', 'source_page', 'tool_name'].sort(),
  )
})

test('buildLeadPayload defaults message to an empty string when not supplied', () => {
  const payload = buildLeadPayload({
    name: 'Jane Owner',
    email: 'jane@example.com',
    phone: '2025551212',
    location: 'Washington, DC',
    toolName: 'Get a Read',
    sourcePage: '/get-started',
  })

  expect(payload.message).toBe('')
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

  const payload = buildLeadPayload({
    name: 'Jane Owner',
    email: 'jane@example.com',
    phone: '2025551212',
    location: 'Washington, DC',
    toolName: 'NOI Leak Audit',
    sourcePage: '/tools/noi-check',
    units: 12,
  })
  await submitLead(payload)

  expect(fetchMock).toHaveBeenCalledWith(
    'https://example.com/webhook',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  )
})

test('submitLead falls back to the live GHL webhook when the env var is unset', async () => {
  import.meta.env.PUBLIC_GHL_WEBHOOK_URL = ''
  const fetchMock = vi.fn().mockResolvedValue({ ok: true })
  global.fetch = fetchMock as unknown as typeof fetch

  const payload = buildLeadPayload({
    name: 'Jane Owner',
    email: 'jane@example.com',
    phone: '2025551212',
    location: 'Washington, DC',
    toolName: 'NOI Leak Audit',
    sourcePage: '/tools/noi-check',
  })
  await submitLead(payload)

  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringMatching(/^https:\/\/services\.leadconnectorhq\.com\/hooks\/yGq2yl5q6YBMPRf0W7j1\//),
    expect.objectContaining({ method: 'POST' }),
  )
})

test('submitLead no-ops with a console note when the webhook URL is "off"', async () => {
  import.meta.env.PUBLIC_GHL_WEBHOOK_URL = 'off'
  const fetchMock = vi.fn()
  global.fetch = fetchMock as unknown as typeof fetch
  const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

  const payload = buildLeadPayload({
    name: 'Jane Owner',
    email: 'jane@example.com',
    phone: '2025551212',
    location: 'Washington, DC',
    toolName: 'Get a Read',
    sourcePage: '/get-started',
  })
  await submitLead(payload)

  expect(fetchMock).not.toHaveBeenCalled()
  expect(infoSpy).toHaveBeenCalled()
})
