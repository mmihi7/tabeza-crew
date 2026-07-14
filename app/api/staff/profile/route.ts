import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { preferred_roles, marketplace_visible, preferred_locations } = body

    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

    const supabase = createServiceRoleClient()
    let userId: string | null = null

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id ?? null
    }

    if (!userId) {
      return NextResponse.json({ error: 'Could not identify user' }, { status: 401 })
    }

    const { data: existing, error: fetchError } = await (supabase as any)
      .from('crew_members')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (fetchError || !existing?.id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // ✅ Build update payload conditionally
    const updatePayload: Record<string, any> = {}

    // Only include fields that are present in the request
    if (preferred_roles !== undefined) {
      updatePayload.preferred_roles = Array.isArray(preferred_roles) ? preferred_roles : []
    }

    if (marketplace_visible !== undefined) {
      updatePayload.marketplace_visible = marketplace_visible === true || marketplace_visible === 'true'
    }

    if (preferred_locations !== undefined) {
      updatePayload.preferred_locations = Array.isArray(preferred_locations) ? preferred_locations : []
    }

    // If no valid fields to update, return early
    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No fields to update' 
      })
    }

    const { error: updateError } = await (supabase as any)
      .from('crew_members')
      .update(updatePayload)
      .eq('id', existing.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      updated: updatePayload
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Update failed' },
      { status: 500 }
    )
  }
}

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

    // ✅ Added face_photo_url and face_thumbnail_url to the select
    const { data: profile, error } = await (supabase as any)
      .from('crew_members')
      .select(`
        id, 
        display_name, 
        phone_number, 
        bio, 
        onboarding_status, 
        performance_score, 
        total_approved_orders, 
        total_tips_received, 
        total_likes, 
        total_shifts_completed, 
        marketplace_visible, 
        preferred_roles, 
        preferred_locations, 
        availability_status,
        face_photo_url,
        face_thumbnail_url
      `)
      .eq('user_id', user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}