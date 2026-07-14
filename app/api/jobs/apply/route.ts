import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

// POST /api/jobs/apply
// Creates a shift application for a crew member to a shift posting
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { postingId } = body

    if (!postingId) {
      return NextResponse.json({ error: 'postingId is required' }, { status: 400 })
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
    const { data: staff } = await (supabase as any)
      .from('crew_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!staff?.id) {
      return NextResponse.json({ error: 'Crew member profile not found' }, { status: 404 })
    }

    // Check if the posting exists and is open
    const { data: posting } = await (supabase as any)
      .from('shift_postings')
      .select('id, status, slots_available')
      .eq('id', postingId)
      .single()

    if (!posting) {
      return NextResponse.json({ error: 'Shift posting not found' }, { status: 404 })
    }

    if (posting.status !== 'open') {
      return NextResponse.json({ error: 'This shift posting is no longer open' }, { status: 400 })
    }

    if (posting.slots_available <= 0) {
      return NextResponse.json({ error: 'No slots available for this shift' }, { status: 400 })
    }

    // Check if already applied
    const { data: existing } = await (supabase as any)
      .from('shift_applications')
      .select('id')
      .eq('posting_id', postingId)
      .eq('crew_member_id', staff.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'You have already applied to this shift' }, { status: 400 })
    }

    // Create the application
    const { data, error } = await (supabase as any)
      .from('shift_applications')
      .insert({
        posting_id: postingId,
        crew_member_id: staff.id,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[/api/jobs/apply] Insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, applicationId: data.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/jobs/apply] Unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
