import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { preferred_roles } = body

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
      .from('staff_members')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (fetchError || !existing?.id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { error: updateError } = await (supabase as any)
      .from('staff_members')
      .update({
        preferred_roles: Array.isArray(preferred_roles) ? preferred_roles : [],
      })
      .eq('id', existing.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Update failed' },
      { status: 500 }
    )
  }
}
