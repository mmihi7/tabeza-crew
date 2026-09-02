// POST /api/shifts/checkout
// Ends an active crew shift. Blocked if the crew member still has open tabs.
// Mirrors the tabeza-staff checkout endpoint so crew can check out before signout.
// Returns a shift summary (hours worked, orders approved, tips earned, points).

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'
import { crewShiftsKey, invalidateCache } from '@/lib/cache'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shift_id, bar_id } = body

    if (!shift_id || !bar_id) {
      return NextResponse.json({ error: 'shift_id and bar_id required' }, { status: 400 })
    }

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
    const { data: staffMember } = await (supabase as any)
      .from('crew_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!staffMember?.id) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })
    }

    // Check for open tabs still assigned to this crew member
    const { data: openTabs } = await (supabase as any)
      .from('tabs')
      .select('id, table_number')
      .eq('current_crew_id', staffMember.id)
      .eq('bar_id', bar_id)
      .eq('status', 'open')

    if (openTabs && openTabs.length > 0) {
      return NextResponse.json({
        success: false,
        blocked: true,
        reason: 'open_tabs',
        message: `You have ${openTabs.length} open tab${openTabs.length > 1 ? 's' : ''}. Transfer or close them before checking out.`,
        open_tabs: openTabs,
      }, { status: 400 })
    }

    // End the shift
    const checkedOutAt = new Date().toISOString()
    const { error } = await (supabase as any)
      .from('shifts')
      .update({ status: 'ended', checked_out_at: checkedOutAt })
      .eq('id', shift_id)
      .eq('crew_member_id', staffMember.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Invalidate the crew member's shift cache so the ended shift disappears
    await invalidateCache(crewShiftsKey(staffMember.id))

    // Build shift summary from performance events during this shift
    const { data: shift } = await (supabase as any)
      .from('shifts')
      .select('shift_start, checked_in_at')
      .eq('id', shift_id)
      .single()

    const shiftStart = shift?.checked_in_at || shift?.shift_start
    const hoursWorked = shiftStart
      ? ((Date.now() - new Date(shiftStart).getTime()) / 3600000).toFixed(1)
      : '0'

    const { data: events } = await (supabase as any)
      .from('crew_performance_events')
      .select('event_type, points_awarded, tip_amount')
      .eq('crew_member_id', staffMember.id)
      .gte('created_at', shiftStart ?? new Date().toISOString())

    const ordersApproved = events?.filter((e: any) => e.event_type === 'order_approved').length ?? 0
    const tipsEarned = events
      ?.filter((e: any) => e.event_type === 'tip_received')
      .reduce((sum: number, e: any) => sum + (e.tip_amount ?? 0), 0) ?? 0
    const pointsEarned = events?.reduce((sum: number, e: any) => sum + (e.points_awarded ?? 0), 0) ?? 0

    return NextResponse.json({
      success: true,
      summary: {
        hours_worked: hoursWorked,
        orders_approved: ordersApproved,
        tips_earned: tipsEarned,
        points_earned: pointsEarned,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    )
  }
}
