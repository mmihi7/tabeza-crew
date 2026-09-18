import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'
import { CREW_ROSTER_ROLES } from '@/lib/roles'

// GET  /api/venues/connect-request
//   Returns the authenticated crew member's join requests + active roster rows
//   (each joined with venue name/slug) so the crew app can show statuses.
// POST /api/venues/connect-request
//   Self-serve "I work here" — crew requests to join a venue's team roster.
//   Body: { venue (slug or id), role, employment_type }
//   A venue owner/admin/manager then approves from the staff app.

const ALLOWED_ROLES = CREW_ROSTER_ROLES.map(r => r.value)
const ALLOWED_EMPLOYMENT = ['full_time', 'gig']

async function resolveCrew(req: NextRequest, supabase: ReturnType<typeof createServiceRoleClient>) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
  if (!token) return { crew: null as null | { id: string }, error: 'Unauthorized' }

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user?.id) return { crew: null, error: 'Unauthorized' }

  const { data: crew, error } = await (supabase as any)
    .from('crew_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !crew?.id) return { crew: null, error: 'Profile not found' }
  return { crew: { id: crew.id }, error: null }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const { crew, error } = await resolveCrew(req, supabase)
    if (!crew) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })

    const { data: requests } = await (supabase as any)
      .from('bar_crew_requests')
      .select(`
        id, bar_id, role, employment_type, status, requested_at, responded_at,
        created_at,
        bar:bars(id, name, slug)
      `)
      .eq('crew_member_id', crew.id)
      .order('requested_at', { ascending: false })

    const { data: roster } = await (supabase as any)
      .from('bar_crew_members')
      .select(`
        id, bar_id, role, employment_type, active, created_at,
        bar:bars(id, name, slug)
      `)
      .eq('crew_member_id', crew.id)
      .eq('active', true)
      .order('created_at', { ascending: false })

    return NextResponse.json({ requests: requests ?? [], roster: roster ?? [] })
  } catch (err) {
    console.error('[connect-request] GET error:', err)
    return NextResponse.json({ error: 'Failed to load venue connections' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const venue = typeof body.venue === 'string' ? body.venue.trim().toLowerCase() : ''
    const role = typeof body.role === 'string' ? body.role.trim().toLowerCase() : ''
    const employmentType = body.employment_type === 'gig' ? 'gig' : 'full_time'

    if (!venue) {
      return NextResponse.json({ error: 'Venue code is required' }, { status: 400 })
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Please choose a valid role' }, { status: 400 })
    }
    if (!ALLOWED_EMPLOYMENT.includes(employmentType)) {
      return NextResponse.json({ error: 'Invalid employment type' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const { crew, error } = await resolveCrew(req, supabase)
    if (!crew) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })

    // Resolve the venue by slug (venue code) or id.
    let bar: { id: string; name: string; slug: string } | null = null
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(venue)) {
      const { data } = await (supabase as any)
        .from('bars')
        .select('id, name, slug')
        .eq('id', venue)
        .maybeSingle()
      bar = data ?? null
    }
    if (!bar) {
      const { data } = await (supabase as any)
        .from('bars')
        .select('id, name, slug')
        .eq('slug', venue)
        .maybeSingle()
      bar = data ?? null
    }

    if (!bar) {
      return NextResponse.json({ error: 'No venue found with that code. Double-check the code on your table or ask staff.' }, { status: 404 })
    }

    // Already an active roster member → nothing to request.
    const { data: existingRoster } = await (supabase as any)
      .from('bar_crew_members')
      .select('id, role')
      .eq('bar_id', bar.id)
      .eq('crew_member_id', crew.id)
      .eq('active', true)
      .maybeSingle()
    if (existingRoster?.id) {
      return NextResponse.json({
        success: true,
        already_rostered: true,
        message: `You are already on the team at ${bar.name} as ${existingRoster.role}.`,
      })
    }

    // Pending request already exists → surface it instead of duplicating.
    const { data: existingPending } = await (supabase as any)
      .from('bar_crew_requests')
      .select('id, status')
      .eq('bar_id', bar.id)
      .eq('crew_member_id', crew.id)
      .eq('status', 'pending')
      .maybeSingle()
    if (existingPending?.id) {
      return NextResponse.json({
        success: true,
        already_pending: true,
        message: `Your request to join ${bar.name} is already awaiting approval.`,
      })
    }

    const { error: insertError } = await (supabase as any)
      .from('bar_crew_requests')
      .insert({
        bar_id: bar.id,
        crew_member_id: crew.id,
        role,
        employment_type: employmentType,
        requested_by: crew.id,
      })

    if (insertError) {
      console.error('[connect-request] insert error:', insertError.message)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Request sent! ${bar.name} will confirm your spot on the team.`,
      bar: { id: bar.id, name: bar.name },
    })
  } catch (err) {
    console.error('[connect-request] POST error:', err)
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 })
  }
}
