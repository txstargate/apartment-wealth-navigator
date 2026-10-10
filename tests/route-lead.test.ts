import { test, expect, vi } from 'vitest'
// @ts-expect-error plain JS serverless module
import { routeLead, PROGRAM_WORKFLOWS, DEFAULT_WEBHOOK_URL } from '../api/_route.js'

const ENV = { GHL_PIT_TOKEN: 'test-token', GHL_LOCATION_ID: 'loc123' }

const lead = (toolName: string) => ({
  first_name: 'Jane',
  last_name: 'Owner',
  email: 'jane@example.com',
  phone: '2025551212',
  tool_name: toolName,
  property_address: 'Washington, DC',
  message: '',
  route: 'local',
  source_page: '/refinance-readiness/',
})

const json = (body: unknown, ok = true, status = 200) => ({ ok, status, json: async () => body })

// A fake GoHighLevel: webhook, workflow list, contact upsert, enrollment.
function fakeGhl(opts: { status?: string; webhookOk?: boolean; upsertOk?: boolean; enrollOk?: boolean } = {}) {
  const { status = 'published', webhookOk = true, upsertOk = true, enrollOk = true } = opts
  return vi.fn(async (url: string, init?: RequestInit) => {
    if (url === DEFAULT_WEBHOOK_URL) return json({}, webhookOk, webhookOk ? 200 : 500)
    if (url.includes('/workflows/?locationId=loc123')) {
      return json({ workflows: Object.values(PROGRAM_WORKFLOWS).map((id) => ({ id, status })) })
    }
    if (url.endsWith('/contacts/upsert')) {
      return upsertOk ? json({ contact: { id: 'c1' } }) : json({ message: 'bad' }, false, 422)
    }
    if (url.includes('/contacts/c1/workflow/')) return json({}, enrollOk, enrollOk ? 200 : 400)
    throw new Error(`unexpected call ${init?.method ?? 'GET'} ${url}`)
  })
}

test('maps each Navigator program to its GHL sequence workflow', () => {
  expect(PROGRAM_WORKFLOWS['NOI Navigator']).toBe('a3ea39e5-a1ef-4043-a3c5-b275e5e20ec6')
  expect(PROGRAM_WORKFLOWS['Refinance Navigator']).toBe('e26ce09f-9a1f-4823-89c9-e904597b9047')
  expect(PROGRAM_WORKFLOWS['Exit Navigator']).toBe('c5b74198-8c28-4547-88ab-46f148f9481a')
  expect(PROGRAM_WORKFLOWS['Value Navigator']).toBe('9eca2bdc-fc07-4c1c-9515-a73c0a3739e7')
})

test('rejects a lead with neither email nor phone', async () => {
  const fetchImpl = fakeGhl()
  const out = await routeLead({ payload: { ...lead('NOI Navigator'), email: '', phone: '' }, env: ENV, fetchImpl })
  expect(out.status).toBe(400)
  expect(fetchImpl).not.toHaveBeenCalled()
})

test('always forwards the lead to the GHL intake webhook unchanged', async () => {
  const fetchImpl = fakeGhl()
  const payload = lead('NOI Navigator')
  await routeLead({ payload, env: ENV, fetchImpl })
  expect(fetchImpl).toHaveBeenCalledWith(
    DEFAULT_WEBHOOK_URL,
    expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }),
  )
})

test('without the API key it forwards only and enrolls nobody', async () => {
  const fetchImpl = fakeGhl()
  const out = await routeLead({ payload: lead('Refinance Navigator'), env: {}, fetchImpl })
  expect(out.body).toEqual({ ok: true, forwarded: true, enrolled: false, reason: 'not-configured' })
  expect(fetchImpl).toHaveBeenCalledTimes(1)
})

test('a lead from a non-program form is forwarded but not enrolled', async () => {
  const fetchImpl = fakeGhl()
  const out = await routeLead({ payload: lead('Get a Read'), env: ENV, fetchImpl })
  expect(out.body).toMatchObject({ forwarded: true, enrolled: false, reason: 'no-program' })
  expect(fetchImpl).toHaveBeenCalledTimes(1)
})

test('never enrolls into a sequence that is still a draft', async () => {
  const fetchImpl = fakeGhl({ status: 'draft' })
  const out = await routeLead({ payload: lead('Exit Navigator'), env: ENV, fetchImpl })
  expect(out.body).toMatchObject({ forwarded: true, enrolled: false, reason: 'workflow-not-published' })
  expect(fetchImpl.mock.calls.some(([u]) => String(u).includes('/contacts/'))).toBe(false)
})

test('enrolls the contact in the published sequence for its program', async () => {
  const fetchImpl = fakeGhl()
  const out = await routeLead({ payload: lead('Refinance Navigator'), env: ENV, fetchImpl })
  expect(out.body).toEqual({ ok: true, forwarded: true, enrolled: true })
  const enroll = fetchImpl.mock.calls.find(([u]) => String(u).includes('/contacts/c1/workflow/'))
  expect(enroll?.[0]).toBe(
    'https://services.leadconnectorhq.com/contacts/c1/workflow/e26ce09f-9a1f-4823-89c9-e904597b9047',
  )
  const upsert = fetchImpl.mock.calls.find(([u]) => String(u).endsWith('/contacts/upsert'))
  expect(JSON.parse(String(upsert?.[1]?.body))).toMatchObject({
    locationId: 'loc123',
    email: 'jane@example.com',
    firstName: 'Jane',
  })
  expect((upsert?.[1]?.headers as Record<string, string>).Authorization).toBe('Bearer test-token')
})

test('reports upsert and enrollment failures without throwing', async () => {
  let out = await routeLead({ payload: lead('NOI Navigator'), env: ENV, fetchImpl: fakeGhl({ upsertOk: false }) })
  expect(out.body).toMatchObject({ forwarded: true, enrolled: false, reason: 'upsert-failed' })
  out = await routeLead({ payload: lead('NOI Navigator'), env: ENV, fetchImpl: fakeGhl({ enrollOk: false }) })
  expect(out.body).toMatchObject({ forwarded: true, enrolled: false, reason: 'enroll-failed' })
})

test('reports forwarded: false when the intake webhook fails, so the browser can retry it', async () => {
  const out = await routeLead({ payload: lead('NOI Navigator'), env: {}, fetchImpl: fakeGhl({ webhookOk: false }) })
  expect(out.body).toMatchObject({ forwarded: false })
})
