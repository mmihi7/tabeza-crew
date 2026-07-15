import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    let userId: string | null = null
    
    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (error) {
        console.error('[API] Auth error:', error)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = user?.id ?? null
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[API] GET /api/crew/profile - User ID:', userId)

    let { data: profile, error } = await supabase
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
        location,
        availability_status,
        face_photo_url,
        face_thumbnail_url,
        credentials,
        skills,
        photo_crop_x,
        photo_crop_y,
        photo_zoom,
        photo_focus_mode
      `)
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      console.log('[API] No profile found, creating one for user:', userId)
      
      const { data: { user } } = await supabase.auth.getUser(token!)
      const displayName = user?.user_metadata?.display_name || 
                          user?.user_metadata?.full_name || 
                          user?.email?.split('@')[0] || 
                          'Crew Member'
      
      const { data: newProfile, error: createError } = await supabase
        .from('crew_members')
        .insert({
          user_id: userId,
          display_name: displayName,
          phone_number: user?.user_metadata?.phone || user?.email || '',
          onboarding_status: 'active',
          marketplace_visible: true,
          preferred_roles: [],
          location: '',
          credentials: [],
          skills: [],
          bio: '',
          performance_score: 0,
          total_approved_orders: 0,
          total_tips_received: 0,
          total_likes: 0,
          total_shifts_completed: 0,
          photo_crop_x: 0.5,
          photo_crop_y: 0.5,
          photo_zoom: 1.0,
          photo_focus_mode: 'fill',
        })
        .select('*')
        .single()

      if (createError) {
        console.error('[API] Error creating profile:', createError)
        return NextResponse.json({ error: 'Failed to create profile: ' + createError.message }, { status: 500 })
      }

      return NextResponse.json(newProfile)
    }

    if (error) {
      console.error('[API] Profile fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch (err) {
    console.error('[API] GET /api/crew/profile error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      preferred_roles, 
      marketplace_visible, 
      location,
      bio, 
      credentials, 
      skills,
      photo_crop_x,
      photo_crop_y,
      photo_zoom,
      photo_focus_mode
    } = body

    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user?.id) {
      console.error('[API] User error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[API] PATCH /api/crew/profile - User ID:', user.id)

    let { data: existing, error: fetchError } = await supabase
      .from('crew_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('[API] No profile found, creating one during PATCH for user:', user.id)
      
      const displayName = user.user_metadata?.display_name || 
                          user.user_metadata?.full_name || 
                          user.email?.split('@')[0] || 
                          'Crew Member'
      
      const { data: newProfile, error: createError } = await supabase
        .from('crew_members')
        .insert({
          user_id: user.id,
          display_name: displayName,
          phone_number: user.user_metadata?.phone || user.email || '',
          onboarding_status: 'active',
          marketplace_visible: true,
          preferred_roles: preferred_roles || [],
          location: location || '',
          credentials: credentials || [],
          skills: skills || [],
          bio: bio || '',
          performance_score: 0,
          total_approved_orders: 0,
          total_tips_received: 0,
          total_likes: 0,
          total_shifts_completed: 0,
          photo_crop_x: photo_crop_x ?? 0.5,
          photo_crop_y: photo_crop_y ?? 0.5,
          photo_zoom: photo_zoom ?? 1.0,
          photo_focus_mode: photo_focus_mode ?? 'fill',
        })
        .select('id')
        .single()

      if (createError) {
        console.error('[API] Error creating profile:', createError)
        return NextResponse.json({ error: 'Failed to create profile: ' + createError.message }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Profile created successfully',
        created: true
      })
    }

    if (fetchError) {
      console.error('[API] Profile fetch error:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!existing?.id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Build update payload
    const updatePayload: Record<string, any> = {}

    if (preferred_roles !== undefined) {
      updatePayload.preferred_roles = Array.isArray(preferred_roles) ? preferred_roles : []
    }

    if (marketplace_visible !== undefined) {
      updatePayload.marketplace_visible = marketplace_visible === true || marketplace_visible === 'true'
    }

    if (location !== undefined) {
      updatePayload.location = location
    }

    if (bio !== undefined) {
      updatePayload.bio = bio
    }

    if (credentials !== undefined) {
      updatePayload.credentials = Array.isArray(credentials) ? credentials : []
    }

    if (skills !== undefined) {
      updatePayload.skills = Array.isArray(skills) ? skills : []
    }

    // ✅ Photo crop settings
    if (photo_crop_x !== undefined) {
      updatePayload.photo_crop_x = photo_crop_x
    }
    if (photo_crop_y !== undefined) {
      updatePayload.photo_crop_y = photo_crop_y
    }
    if (photo_zoom !== undefined) {
      updatePayload.photo_zoom = photo_zoom
    }
    if (photo_focus_mode !== undefined) {
      updatePayload.photo_focus_mode = photo_focus_mode
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No fields to update' 
      })
    }

    console.log('[API] Updating profile with:', updatePayload)

    const { error: updateError } = await supabase
      .from('crew_members')
      .update(updatePayload)
      .eq('id', existing.id)

    if (updateError) {
      console.error('[API] Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Fetch updated profile
    const { data: updatedProfile, error: fetchUpdatedError } = await supabase
      .from('crew_members')
      .select('*')
      .eq('id', existing.id)
      .single()

    if (fetchUpdatedError) {
      console.error('[API] Fetch updated profile error:', fetchUpdatedError)
    }

    return NextResponse.json({ 
      success: true,
      updated: updatePayload,
      profile: updatedProfile
    })
  } catch (err) {
    console.error('[API] PATCH /api/crew/profile error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Update failed' },
      { status: 500 }
    )
  }
}