import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[API] PATCH /api/staff/profile - Request body:', JSON.stringify(body, null, 2))

    const { 
      preferred_roles, 
      marketplace_visible, 
      preferred_locations, 
      bio, 
      credentials, 
      skills 
    } = body

    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

    const supabase = createServiceRoleClient()
    let userId: string | null = null

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id ?? null
    }

    if (!userId) {
      console.log('[API] No user ID found')
      return NextResponse.json({ error: 'Could not identify user' }, { status: 401 })
    }

    const { data: existing, error: fetchError } = await (supabase as any)
      .from('crew_members')
      .select('id, credentials, skills')
      .eq('user_id', userId)
      .single()

    if (fetchError || !existing?.id) {
      console.log('[API] Profile not found:', fetchError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('[API] Existing profile:', { id: existing.id })

    // Build update payload conditionally
    const updatePayload: Record<string, any> = {}

    if (preferred_roles !== undefined) {
      updatePayload.preferred_roles = Array.isArray(preferred_roles) ? preferred_roles : []
      console.log('[API] Updating preferred_roles:', updatePayload.preferred_roles)
    }

    if (marketplace_visible !== undefined) {
      updatePayload.marketplace_visible = marketplace_visible === true || marketplace_visible === 'true'
      console.log('[API] Updating marketplace_visible:', updatePayload.marketplace_visible)
    }

    if (preferred_locations !== undefined) {
      updatePayload.preferred_locations = Array.isArray(preferred_locations) ? preferred_locations : []
      console.log('[API] Updating preferred_locations:', updatePayload.preferred_locations)
    }

    if (bio !== undefined) {
      updatePayload.bio = bio
      console.log('[API] Updating bio:', updatePayload.bio)
    }

    // Handle credentials - ensure it's an array
    if (credentials !== undefined) {
      const credsArray = Array.isArray(credentials) ? credentials : []
      updatePayload.credentials = credsArray
      console.log('[API] Updating credentials:', JSON.stringify(credsArray, null, 2))
    }

    // Handle skills - ensure it's an array
    if (skills !== undefined) {
      const skillsArray = Array.isArray(skills) ? skills : []
      updatePayload.skills = skillsArray
      console.log('[API] Updating skills:', JSON.stringify(skillsArray, null, 2))
    }

    if (Object.keys(updatePayload).length === 0) {
      console.log('[API] No fields to update')
      return NextResponse.json({ 
        success: true, 
        message: 'No fields to update' 
      })
    }

    console.log('[API] Final update payload:', JSON.stringify(updatePayload, null, 2))

    const { error: updateError } = await (supabase as any)
      .from('crew_members')
      .update(updatePayload)
      .eq('id', existing.id)

    if (updateError) {
      console.log('[API] Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Fetch updated profile to return
    const { data: updatedProfile, error: fetchUpdatedError } = await (supabase as any)
      .from('crew_members')
      .select('*')
      .eq('id', existing.id)
      .single()

    console.log('[API] Updated profile:', JSON.stringify(updatedProfile, null, 2))

    return NextResponse.json({ 
      success: true,
      updated: updatePayload,
      profile: updatedProfile
    })
  } catch (err) {
    console.log('[API] Error:', err)
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

    console.log('[API] GET /api/staff/profile - User ID:', user.id)

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
        face_thumbnail_url,
        credentials,
        skills
      `)
      .eq('user_id', user.id)
      .single()

    if (error || !profile) {
      console.log('[API] Profile not found:', error)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('[API] Returning profile with credentials:', profile.credentials?.length || 0, 'skills:', profile.skills?.length || 0)

    return NextResponse.json(profile)
  } catch (err) {
    console.log('[API] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}