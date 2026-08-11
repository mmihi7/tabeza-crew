import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'
import { fetchOrCache, crewCheckinsKey, invalidateCache } from '@/lib/cache'

// GET /api/shifts/checkin-request?shiftIds=id1,id2
// Fetches check-in request status — Redis-cached, 10s TTL
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shiftIds = (searchParams.get('shiftIds') || '').split(',').filter(Boolean)

    if (shiftIds.length === 0) {
      return NextResponse.json({ requests: [] })
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

    const { data: staff } = await (supabase as any)
      .from('crew_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!staff?.id) {
      return NextResponse.json({ error: 'Crew member profile not found' }, { status: 404 })
    }

    const cacheKey = crewCheckinsKey(staff.id, shiftIds.join(','))

    const result = await fetchOrCache(cacheKey, async () => {
      const { data: requests, error } = await (supabase as any)
        .from('check_in_requests')
        .select('id, shift_id, status, requested_at')
        .eq('crew_member_id', staff.id)
        .in('shift_id', shiftIds)
        .order('requested_at', { ascending: false })

      if (error) throw new Error(error.message)

      return { requests: requests ?? [] }
    }, 10)

    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/shifts/checkin-request
// Crew member requests check-in for a scheduled shift.
// Manager must approve before the shift becomes active.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shiftId } = body

    if (!shiftId) {
      return NextResponse.json({ error: 'shiftId is required' }, { status: 400 })
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

    const { data: staff } = await (supabase as any)
      .from('crew_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!staff?.id) {
      return NextResponse.json({ error: 'Crew member profile not found' }, { status: 404 })
    }

    // Validate the shift: must be scheduled, belong to this crew member,
    // and be within the check-in window (30 min before to 2 hours after start)
    const { data: shift } = await (supabase as any)
      .from('shifts')
      .select('id, crew_member_id, bar_id, status, shift_start, shift_end')
      .eq('id', shiftId)
      .single()

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    if (shift.crew_member_id !== staff.id) {
      return NextResponse.json({ error: 'This shift is not assigned to you' }, { status: 403 })
    }

    if (shift.status !== 'scheduled') {
      return NextResponse.json({ error: 'This shift is not in a check-in state' }, { status: 400 })
    }

    const now = Date.now()
    const shiftStart = new Date(shift.shift_start).getTime()
    const windowStarts = shiftStart - 30 * 60 * 1000
    const windowEnds = shiftStart + 2 * 60 * 60 * 1000

    if (now < windowStarts) {
      const minsUntil = Math.ceil((windowStarts - now) / 60000)
      return NextResponse.json(
        { error: `Check-in opens ${minsUntil} minute${minsUntil === 1 ? '' : 's'} before your shift` },
        { status: 400 }
      )
    }

    if (now > windowEnds) {
      return NextResponse.json(
        { error: 'Check-in window has closed. Contact the venue manager.' },
        { status: 400 }
      )
    }

    // Check for existing pending check-in request (idempotency)
    const { data: existing } = await (supabase as any)
      .from('check_in_requests')
      .select('id, status')
      .eq('shift_id', shiftId)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: true, requestId: existing.id, alreadySubmitted: true })
    }

    const { data: checkin, error } = await (supabase as any)
      .from('check_in_requests')
      .insert({
        shift_id: shiftId,
        crew_member_id: staff.id,
        bar_id: shift.bar_id,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[/api/shifts/checkin-request] Insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await invalidateCache(`crew:checkins:${staff.id}:*`)

    return NextResponse.json({ success: true, requestId: checkin.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/shifts/checkin-request] Unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
