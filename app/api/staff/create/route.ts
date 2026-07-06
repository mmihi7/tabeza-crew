// POST /api/staff/create
// Creates a staff_members row for a newly signed-up user.
// Called from signup page — uses service role to bypass RLS.
// The browser client cannot insert into staff_members directly
// because the user's session isn't confirmed yet at signup time.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      display_name,
      phone_number,
      preferred_locations,
      preferred_roles,
      latitude,
      longitude,
    } = body

    if (!display_name || !phone_number) {
      return NextResponse.json(
        { error: 'display_name and phone_number are required' },
        { status: 400 }
      )
    }

    // Get the authenticated user from the request
    const supabase = createServiceRoleClient()
    const authHeader = req.headers.get('authorization')

    let userId: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id ?? null
    }

    // Also try the cookie-based session
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    }

    if (!userId) {
      return NextResponse.json({ error: 'Could not identify user' }, { status: 401 })
    }

    // Check if row already exists (idempotent)
    const { data: existing } = await (supabase as any)
      .from('staff_members')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Already exists — update location if provided
      if (latitude && longitude) {
        await (supabase as any)
          .from('staff_members')
          .update({
            latitude,
            longitude,
            preferred_locations: preferred_locations ?? [],
            preferred_roles: preferred_roles ?? ['waiter'],
            source: 'crew',
            marketplace_visible: true,
          })
          .eq('id', existing.id)
      }
      return NextResponse.json({ success: true, staff_member_id: existing.id, existed: true })
    }

    // Create the staff_members row
    const { data, error } = await (supabase as any)
      .from('staff_members')
      .insert({
        user_id: userId,
        display_name,
        phone_number,
        onboarding_status: 'active',
        marketplace_visible: true,       // visible by default so venues can find them
        preferred_locations: preferred_locations ?? [],
        preferred_roles: preferred_roles ?? ['waiter'],
        source: 'crew',
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        performance_score: 0,
        total_approved_orders: 0,
        total_tips_received: 0,
        total_likes: 0,
        total_shifts_completed: 0,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[/api/staff/create] Insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, staff_member_id: data.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/staff/create] Unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
