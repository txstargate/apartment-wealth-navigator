// First-touch UTM capture. Pure functions plus a thin storage wrapper, so the
// lead record can say where a visitor came from. Values stay in the visitor's
// own tab (sessionStorage) and travel only inside the lead submission.

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const
export const UTM_STORAGE_KEY = 'aw-utm'

export type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>

// Lowercase, letters, digits, underscore, hyphen, dot. Anything else is
// dropped, which also keeps names, emails and addresses out of the record.
function clean(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, 100)
}

export function parseUtm(search: string): Utm {
  const params = new URLSearchParams(search)
  const out: Utm = {}
  for (const key of UTM_KEYS) {
    const raw = params.get(key)
    if (!raw) continue
    const value = clean(raw)
    if (value) out[key] = value
  }
  return out
}

function hasAny(utm: Utm): boolean {
  return Object.keys(utm).length > 0
}

// First touch wins inside a session: a tagged link replaces nothing that is
// already stored.
export function captureUtm(search: string, storage: Pick<Storage, 'getItem' | 'setItem'>): void {
  const found = parseUtm(search)
  if (!hasAny(found)) return
  try {
    if (storage.getItem(UTM_STORAGE_KEY)) return
    storage.setItem(UTM_STORAGE_KEY, JSON.stringify(found))
  } catch {
    // Storage blocked: the lead still goes through without a source.
  }
}

export function readUtm(storage: Pick<Storage, 'getItem'>): Utm {
  try {
    const raw = storage.getItem(UTM_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const out: Utm = {}
    for (const key of UTM_KEYS) {
      const value = parsed[key]
      if (typeof value === 'string' && value) out[key] = clean(value)
    }
    return out
  } catch {
    return {}
  }
}
