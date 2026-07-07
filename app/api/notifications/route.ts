import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

// GET /api/notifications
// Returns notifications for the authenticated crew member
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

    // Get the staff member record
    const { data: staff } = await (supabase as any)
      .from('staff_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!staff?.id) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })
    }

    // Fetch notifications
    const { data: notifications } = await (supabase as any)
      .from('staff_notifications')
      .select('*')
      .eq('staff_member_id', staff.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({
      notifications: (notifications ?? []).map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        priority: n.priority || 'normal',
        readAt: n.read_at,
        actionUrl: n.action_url,
        createdAt: n.created_at,
      }))
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications
// Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { ids } = body

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

    const now = new Date().toISOString()

    const { error } = await (supabase as any)
      .from('staff_notifications')
      .update({ read_at: now })
      .in('id', ids)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
