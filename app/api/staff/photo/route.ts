import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    const providedUserId = formData.get('userId')

    if (!file || typeof file === 'string' || !file.name || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'A valid image file is required' }, { status: 400 })
    }

    const userId = typeof providedUserId === 'string' && providedUserId ? providedUserId : user.id
    const filePath = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const bytes = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('crew-images')
      .upload(filePath, new Uint8Array(bytes), {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: publicData } = supabase.storage.from('crew-images').getPublicUrl(filePath)
    const photoUrl = publicData.publicUrl

    // ─── Persist photo URL to crew_members table ─────────────────────────
    // This is what makes the photo visible in the crew marketplace.
    // Without this, the URL only lives in localStorage and disappears on restart.
    const { data: crewMember } = await (supabase as any)
      .from('crew_members')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (crewMember?.id) {
      // Write to crew_members direct columns (used by crew app reads)
      await (supabase as any)
        .from('crew_members')
        .update({
          face_photo_url: photoUrl,
          face_thumbnail_url: photoUrl,
        })
        .eq('id', crewMember.id)

      // Write to crew_profile_photos (used by marketplace view v_crew_public_profile)
      // This ensures photos are immediately visible in venue searches
      const { data: existing } = await (supabase as any)
        .from('crew_profile_photos')
        .select('id')
        .eq('crew_member_id', crewMember.id)
        .eq('photo_type', 'face')
        .maybeSingle()

      if (existing?.id) {
        await (supabase as any)
          .from('crew_profile_photos')
          .update({
            url: photoUrl,
            thumbnail_url: photoUrl,
            is_primary: true,
            is_public: true,
          })
          .eq('id', existing.id)
      } else {
        await (supabase as any)
          .from('crew_profile_photos')
          .insert({
            crew_member_id: crewMember.id,
            photo_type: 'face',
            url: photoUrl,
            thumbnail_url: photoUrl,
            is_primary: true,
            is_public: true,
          })
      }
    }

    return NextResponse.json({ url: photoUrl, path: filePath })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
