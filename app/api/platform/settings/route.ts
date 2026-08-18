// app/api/platform/settings/route.ts
// Public, read-only endpoint — exposes non-sensitive platform feature flags.
// Read via service-role client (platform_settings RLS blocks anon reads).
// Used by the crew hook at startup to gate UI features.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

const SELECT_FIELDS = [
  'crew_marketplace_enabled',
  'customer_ordering_enabled',
  'loyalty_enabled',
  'mpesa_enabled',
  'pos_printer_enabled',
  'global_products_enabled',
  'media_system_enabled',
  'promotions_ai_enabled',
  'webhooks_enabled',
  'maintenance_mode',
].join(', ')

const SAFE_DEFAULTS = {
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

export async function GET(_req: NextRequest) {
  try {
    const db = createServiceRoleClient()
    const { data, error } = await (db as any)
      .from('platform_settings')
      .select(SELECT_FIELDS)
      .eq('id', 1)
      .maybeSingle()

    if (error || !data) return NextResponse.json(SAFE_DEFAULTS)
    return NextResponse.json({ ...SAFE_DEFAULTS, ...data })
  } catch {
    return NextResponse.json(SAFE_DEFAULTS)
  }
}
