import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

// GET /api/history
// Returns shift history for the authenticated crew member
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

    // Get the staff member record
    const { data: staff } = await (supabase as any)
      .from('staff_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!staff?.id) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })
    }

    // Fetch completed shifts
    const { data: shifts } = await (supabase as any)
      .from('staff_shifts')
      .select(`
        id,
        role,
        shift_start,
        shift_end,
        checked_in_at,
        checked_out_at,
        status,
        orders_approved,
        tips_earned,
        rating,
        review_count,
        bar:bars(id, name, display_name)
      `)
      .eq('staff_member_id', staff.id)
      .eq('status', 'ended')
      .order('shift_start', { ascending: false })
      .limit(100)

    return NextResponse.json({
      shifts: (shifts ?? []).map((s: any) => ({
        id: s.id,
        barName: s.bar ? (s.bar.display_name || s.bar.name) : 'Unknown',
        date: new Date(s.shift_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        startTime: new Date(s.shift_start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(s.shift_end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        durationHours: Math.round((new Date(s.shift_end).getTime() - new Date(s.shift_start).getTime()) / (1000 * 60 * 60) * 10) / 10,
        ordersApproved: s.orders_approved || 0,
        tipsEarned: s.tips_earned || 0,
        rating: s.rating || 0,
        reviewCount: s.review_count || 0,
      }))
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
