import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

// GET /api/shifts
// Returns active and upcoming shifts for the authenticated crew member
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

    const now = new Date().toISOString()

    // Fetch active shifts (currently running)
    const { data: activeShifts } = await (supabase as any)
      .from('shifts')
      .select(`
        id,
        role,
        shift_start,
        shift_end,
        checked_in_at,
        status,
        bar:bars(id, name, display_name, logo_url)
      `)
      .eq('staff_member_id', staff.id)
      .eq('status', 'active')
      .order('shift_start', { ascending: true })

    // Fetch upcoming shifts
    const { data: upcomingShifts } = await (supabase as any)
      .from('shifts')
      .select(`
        id,
        role,
        shift_start,
        shift_end,
        pay_amount,
        status,
        bar:bars(id, name, display_name, logo_url)
      `)
      .eq('staff_member_id', staff.id)
      .in('status', ['scheduled'])
      .gte('shift_start', now)
      .order('shift_start', { ascending: true })
      .limit(10)

    // Fetch assigned tabs for active shifts
    const { data: assignedTabs } = await (supabase as any)
      .from('tab_assignments')
      .select(`
        id,
        table_number,
        tab:tabs(id, table_number, customer_id, current_balance, created_at)
      `)
      .in('staff_shift_id', (activeShifts || []).map((s: any) => s.id))
      .is('ended_at', null)

    return NextResponse.json({
      activeShifts: (activeShifts ?? []).map((s: any) => ({
        id: s.id,
        role: s.role,
        shiftStart: s.shift_start,
        shiftEnd: s.shift_end,
        checkedInAt: s.checked_in_at,
        status: s.status,
        venue: s.bar ? {
          id: s.bar.id,
          name: s.bar.display_name || s.bar.name,
          logo: s.bar.logo_url,
        } : null,
      })),
      upcomingShifts: (upcomingShifts ?? []).map((s: any) => ({
        id: s.id,
        role: s.role,
        shiftStart: s.shift_start,
        shiftEnd: s.shift_end,
        payAmount: s.pay_amount,
        status: s.status,
        venue: s.bar ? {
          id: s.bar.id,
          name: s.bar.display_name || s.bar.name,
          logo: s.bar.logo_url,
        } : null,
      })),
      assignedTabs: (assignedTabs ?? []).map((t: any) => ({
        id: t.id,
        tableNumber: t.tab?.table_number,
        customerName: t.tab?.customer_id ? 'Guest' : 'Anonymous',
        currentBalance: t.tab?.current_balance || 0,
      })),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch shifts' },
      { status: 500 }
    )
  }
}

// POST /api/shifts
// Check in to a shift
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shiftId } = body

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

    const now = new Date().toISOString()

    const { error } = await (supabase as any)
      .from('shifts')
      .update({
        status: 'active',
        checked_in_at: now,
      })
      .eq('id', shiftId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Check-in failed' },
      { status: 500 }
    )
  }
}
