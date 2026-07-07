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

    // ─── Persist photo URL to staff_members table ─────────────────────────
    // This is what makes the photo visible in the staff marketplace.
    // Without this, the URL only lives in localStorage and disappears on restart.
    const { data: staffMember } = await (supabase as any)
      .from('staff_members')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (staffMember?.id) {
      await (supabase as any)
        .from('staff_members')
        .update({
          face_photo_url: photoUrl,
          face_thumbnail_url: photoUrl,
        })
        .eq('id', staffMember.id)
    }

    return NextResponse.json({ url: photoUrl, path: filePath })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
