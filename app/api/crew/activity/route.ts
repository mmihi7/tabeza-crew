import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/crew/activity?crew_member_id=<uuid>
// Recent loyalty-engine activity for the crew member (home page activity log).
export async function GET(req: NextRequest) {
  try {
    const crewMemberId = req.nextUrl.searchParams.get('crew_member_id')
    if (!crewMemberId) {
      return NextResponse.json({ error: 'crew_member_id is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const { data: loyaltyCfg } = await (supabase as any)
      .from('loyalty_system_config')
      .select('is_shadow_mode')
      .eq('id', true)
      .maybeSingle()
    if (loyaltyCfg?.is_shadow_mode === true) {
      return NextResponse.json({ events: [] })
    }

    const { data, error } = await supabase
      .from('loyalty_events')
      .select('id, event_type, crew_points, created_at, bar_id, bars(name)')
      .eq('crew_member_id', crewMemberId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[API] GET /api/crew/activity error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ events: data || [] })
  } catch (err) {
    console.error('[API] GET /api/crew/activity error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}