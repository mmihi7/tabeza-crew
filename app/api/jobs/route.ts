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

    // Fetch hire requests sent to this staff member
    const { data: hireRequests } = await (supabase as any)
      .from('shift_applications')
      .select(`
        id,
        status,
        created_at,
        bar:bars(id, name, display_name, logo_url, latitude, longitude)
      `)
      .eq('staff_member_id', staff.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Fetch available shift postings
    const { data: postings } = await (supabase as any)
      .from('shift_postings')
      .select(`
        id,
        title,
        role,
        pay_rate,
        shift_date,
        start_time,
        end_time,
        status,
        bar:bars(id, name, display_name, logo_url, latitude, longitude)
      `)
      .eq('status', 'open')
      .order('shift_date', { ascending: true })
      .limit(50)

    return NextResponse.json({
      hireRequests: (hireRequests ?? []).map((hr: any) => ({
        id: hr.id,
        status: hr.status,
        date: hr.created_at,
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
        title: p.title,
        role: p.role,
        payRate: p.pay_rate,
        shiftDate: p.shift_date,
        startTime: p.start_time,
        endTime: p.end_time,
        status: p.status,
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
