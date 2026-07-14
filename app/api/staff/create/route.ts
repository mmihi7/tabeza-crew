// POST /api/staff/create
// Creates a crew_members row for a newly signed-up user.
// Called from signup page — uses service role to bypass RLS.
// The browser client cannot insert into crew_members directly
// because the user's session isn't confirmed yet at signup time.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      display_name,
      phone_number,
      location,
      preferred_roles,
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
      .from('crew_members')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Already exists — update preferences if provided
      const updatePayload: Record<string, any> = {}
      
      if (location !== undefined) {
        updatePayload.location = location
      }
      if (preferred_roles !== undefined) {
        updatePayload.preferred_roles = preferred_roles
      }

      if (Object.keys(updatePayload).length > 0) {
        await (supabase as any)
          .from('crew_members')
          .update(updatePayload)
          .eq('id', existing.id)
      }
      
      return NextResponse.json({ 
        success: true, 
        crew_member_id: existing.id, 
        existed: true 
      })
    }

    // Create the crew_members row
    const { data, error } = await (supabase as any)
      .from('crew_members')
      .insert({
        user_id: userId,
        display_name,
        phone_number,
        onboarding_status: 'active',
        marketplace_visible: true,
        location: location || '',
        preferred_roles: preferred_roles ?? [],
        performance_score: 0,
        total_approved_orders: 0,
        total_tips_received: 0,
        total_likes: 0,
        total_shifts_completed: 0,
        bio: '',
        credentials: [],
        skills: [],
      })
      .select('id')
      .single()

    if (error) {
      console.error('[/api/staff/create] Insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      crew_member_id: data.id 
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/staff/create] Unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}