import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'
import { fetchOrCache, crewHistoryKey } from '@/lib/cache'

// GET /api/history
// Returns shift history for the authenticated crew member — Redis-cached, 10s TTL
// (short TTL so a shift the venue just ended appears in history promptly)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the crew member record
    const { data: staff } = await (supabase as any)
      .from('crew_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!staff?.id) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })
    }

    const cacheKey = crewHistoryKey(staff.id)

    const result = await fetchOrCache(cacheKey, async () => {
      const { data: shifts } = await (supabase as any)
        .from('v_crew_shift_summary')
        .select(`
          shift_id,
          crew_member_id,
          bar_id,
          bar_name,
          role,
          shift_start,
          shift_end,
          status,
          orders_approved,
          tips_earned,
          likes_received
        `)
        .eq('crew_member_id', staff.id)
        .eq('status', 'ended')
        .order('shift_start', { ascending: false })
        .limit(100)

      const rows = shifts ?? []

      // Venue reputation for each shift's venue (aggregated crew reviews).
      // `venue_crew_metrics` is the public rollup of `crew_venue_reviews`.
      const barIds = Array.from(new Set(rows.map((s: any) => s.bar_id).filter(Boolean)))
      const metricsByBar: Record<string, { rating: number; reviewCount: number }> = {}
      if (barIds.length > 0) {
        const { data: metrics } = await (supabase as any)
          .from('venue_crew_metrics')
          .select('bar_id, avg_payout_reliability, avg_treatment, avg_shifts_available, review_count')
          .in('bar_id', barIds)
        for (const m of metrics ?? []) {
          const count = Number(m.review_count) || 0
          const avg = count > 0
            ? (Number(m.avg_payout_reliability) + Number(m.avg_treatment) + Number(m.avg_shifts_available)) / 3
            : 0
          metricsByBar[m.bar_id] = {
            rating: Math.round(avg * 10) / 10,
            reviewCount: count,
          }
        }
      }

      return {
        shifts: rows.map((s: any) => {
          const reputation = metricsByBar[s.bar_id] ?? { rating: 0, reviewCount: 0 }
          return {
            id: s.shift_id,
            bar_id: s.bar_id || undefined,
            barName: s.bar_name || 'Unknown',
            date: new Date(s.shift_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            startTime: new Date(s.shift_start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            endTime: s.shift_end
              ? new Date(s.shift_end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
              : '',
            durationHours: s.shift_end
              ? Math.round((new Date(s.shift_end).getTime() - new Date(s.shift_start).getTime()) / (1000 * 60 * 60) * 10) / 10
              : 0,
            ordersApproved: s.orders_approved || 0,
            tipsEarned: s.tips_earned || 0,
            rating: reputation.rating,
            reviewCount: reputation.reviewCount,
          }
        })
      }
    }, 10)

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
