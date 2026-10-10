// POST /api/route-lead: Vercel serverless entry point. Logic lives in _route.js.
import { routeLead } from './_route.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' })

  let payload = req.body
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload)
    } catch {
      payload = null
    }
  }

  const out = await routeLead({ payload, env: process.env, fetchImpl: fetch })
  if (out.body.reason && out.body.reason !== 'no-program') {
    console.log('route-lead', payload && payload.tool_name, out.body.reason)
  }
  return res.status(out.status).json(out.body)
}
