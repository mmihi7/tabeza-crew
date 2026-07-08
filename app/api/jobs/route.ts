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

    // Get the staff member record
    const { data: staff } = await (supabase as any)
      .from('staff_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!staff?.id) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })
    }

    // Fetch hire requests sent to this staff member — from hire_requests table
    const { data: hireRequests } = await (supabase as any)
      .from('hire_requests')
      .select(`
        id,
        role,
        shift_date,
        shift_start,
        shift_end,
        pay_amount,
        message,
        status,
        sent_at,
        expires_at,
        bar:bars(id, name, display_name, logo_url, latitude, longitude)
      `)
      .eq('staff_member_id', staff.id)
      .in('status', ['pending', 'accepted', 'declined'])
      .order('sent_at', { ascending: false })
      .limit(20)

    // Fetch available shift postings — with correct column names
    const { data: postings } = await (supabase as any)
      .from('shift_postings')
      .select(`
        id,
        role,
        shift_date,
        shift_start,
        shift_end,
        pay_per_shift,
        slots_available,
        preferred_performance_tier,
        description,
        latitude,
        longitude,
        bar:bars(id, name, display_name, logo_url, latitude, longitude)
      `)
      .eq('status', 'open')
      .gte('shift_date', new Date().toISOString().slice(0, 10))
      .order('shift_date', { ascending: true })
      .limit(50)

    return NextResponse.json({
      hireRequests: (hireRequests ?? []).map((hr: any) => ({
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
        venue: hr.bar ? {
          id: hr.bar.id,
          name: hr.bar.display_name || hr.bar.name,
          logo: hr.bar.logo_url,
          lat: hr.bar.latitude,
          lng: hr.bar.longitude,
        } : null,
      })),
      postings: (postings ?? []).map((p: any) => ({
        id: p.id,
        role: p.role,
        shiftDate: p.shift_date,
        shiftStart: p.shift_start,
        shiftEnd: p.shift_end,
        payPerShift: p.pay_per_shift,
        slotsAvailable: p.slots_available,
        preferredTier: p.preferred_performance_tier,
        description: p.description,
        lat: p.latitude || p.bar?.latitude,
        lng: p.longitude || p.bar?.longitude,
        venue: p.bar ? {
          id: p.bar.id,
          name: p.bar.display_name || p.bar.name,
          logo: p.bar.logo_url,
          lat: p.bar.latitude,
          lng: p.bar.longitude,
        } : null,
      })),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
