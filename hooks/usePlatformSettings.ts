// hooks/usePlatformSettings.ts
// Reads platform feature flags from the public /api/platform/settings endpoint
// (which itself reads via service-role client — platform_settings RLS blocks
// anon reads, so this hook must not query Supabase directly).
// Module-cached — one fetch per app session, refreshes every 5 minutes.
// Defaults to true (permissive) on any error so features are never
// accidentally hidden due to a network or DB issue.

import { useEffect, useState } from 'react'

export interface PlatformFlags {
  crew_marketplace_enabled: boolean
  customer_ordering_enabled: boolean
  loyalty_enabled: boolean
  mpesa_enabled: boolean
  pos_printer_enabled: boolean
  global_products_enabled: boolean
  media_system_enabled: boolean
  promotions_ai_enabled: boolean
  webhooks_enabled: boolean
  maintenance_mode: boolean
}

const DEFAULTS: PlatformFlags = {
  crew_marketplace_enabled: true,
  customer_ordering_enabled: true,
  loyalty_enabled: true,
  mpesa_enabled: true,
  pos_printer_enabled: true,
  global_products_enabled: true,
  media_system_enabled: true,
  promotions_ai_enabled: false,
  webhooks_enabled: true,
  maintenance_mode: false,
}

let cachedFlags: PlatformFlags | null = null
let lastFetch = 0
const CACHE_TTL_MS = 5 * 60 * 1000

async function fetchFlags(): Promise<PlatformFlags> {
  try {
    const res = await fetch('/api/platform/settings', { cache: 'no-store' })
    if (!res.ok) return { ...DEFAULTS }
    const data = await res.json()
    return { ...DEFAULTS, ...data }
  } catch {
    return { ...DEFAULTS }
  }
}

export function usePlatformSettings(): { flags: PlatformFlags; loading: boolean } {
  const [flags, setFlags] = useState<PlatformFlags>(cachedFlags ?? DEFAULTS)
  const [loading, setLoading] = useState(!cachedFlags)

  useEffect(() => {
    const now = Date.now()
    if (cachedFlags && now - lastFetch < CACHE_TTL_MS) {
      setFlags(cachedFlags)
      setLoading(false)
      return
    }

    fetchFlags().then(fresh => {
      cachedFlags = fresh
      lastFetch = Date.now()
      setFlags(fresh)
      setLoading(false)
    })
  }, [])

  return { flags, loading }
}
