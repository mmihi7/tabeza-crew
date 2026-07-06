import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase environment is not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
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

    return NextResponse.json({ url: publicData.publicUrl, path: filePath })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
