import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

// GET /api/jobs
// Returns pending hire requests + active shift postings for the authenticated crew member
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

    // Get the crew member record — optional for postings, required for hire requests
    const { data: staff, error: staffError } = await (supabase as any)
      .from('crew_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (staffError) {
      console.error('[/api/jobs] crew_members query error:', staffError)
    }

    console.log('[/api/jobs] crew member record:', staff)

    // Fetch hire requests only if we have a crew member profile
    let hireRequests: any[] = []
    if (staff?.id) {
      const { data, error: hrError } = await (supabase as any)
        .from('hire_requests')
        .select(`
          id, role, shift_date, shift_start, shift_end,
          pay_amount, message, status, sent_at, expires_at,
          bars ( id, name, latitude, longitude )
        `)
        .eq('crew_member_id', staff.id)
        .in('status', ['pending', 'accepted', 'declined'])
        .order('sent_at', { ascending: false })
        .limit(20)

      if (!hrError) hireRequests = data ?? []
    }

    // Fetch open shift postings — available to ALL authenticated crew regardless of profile
    const today = new Date().toISOString().slice(0, 10)
    const { data: postings, error: postingsError } = await (supabase as any)
      .from('shift_postings')
      .select(`
        id, role, shift_date, shift_start, shift_end,
        pay_per_shift, slots_available, preferred_performance_tier,
        description, latitude, longitude,
        bars ( id, name, latitude, longitude )
      `)
      .eq('status', 'open')
      .gte('shift_date', today)
      .order('shift_date', { ascending: true })
      .limit(50)

    if (postingsError) {
      console.error('[/api/jobs] postings error:', postingsError)
    } else {
      console.log('[/api/jobs] postings count:', postings?.length || 0)
    }

    return NextResponse.json({
      hireRequests: hireRequests.map((hr: any) => {
        const bar = hr.bars
        return {
          id: hr.id,
          role: hr.role,
          shiftDate: hr.shift_date,
          shiftStart: hr.shift_start,
          shiftEnd: hr.shift_end,
          payAmount: hr.pay_amount,
          message: hr.message,
          status: hr.status,
          sentAt: hr.sent_at,
          expiresAt: hr.expires_at,
          venue: bar ? {
            id: bar.id,
            name: bar.name,
            lat: bar.latitude,
            lng: bar.longitude,
          } : null,
        }
      }),
      postings: (postings ?? []).map((p: any) => {
        const bar = p.bars
        return {
          id: p.id,
          role: p.role,
          shiftDate: p.shift_date,
          shiftStart: p.shift_start,
          shiftEnd: p.shift_end,
          payPerShift: p.pay_per_shift,
          slotsAvailable: p.slots_available,
          preferredTier: p.preferred_performance_tier,
          description: p.description,
          lat: p.latitude || bar?.latitude,
          lng: p.longitude || bar?.longitude,
          venue: bar ? {
            id: bar.id,
            name: bar.name,
            lat: bar.latitude,
            lng: bar.longitude,
          } : null,
        }
      }),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
