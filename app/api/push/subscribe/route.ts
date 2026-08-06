import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

type SubscribeBody = {
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
}

// POST /api/push/subscribe
// Registers (upserts) the device's push subscription for the signed-in
// user. Used by both the crew app and (via the same table) the staff
// app — push_subscriptions is keyed by auth.users id.
export async function POST(req: NextRequest) {
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

    const body: SubscribeBody = await req.json()
    if (!body.endpoint || !body.p256dh || !body.auth) {
      return NextResponse.json({ error: 'endpoint, p256dh and auth are required' }, { status: 400 })
    }

    const { error } = await (supabase as any)
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: body.endpoint,
        p256dh: body.p256dh,
        auth_secret: body.auth,
        user_agent: body.userAgent || req.headers.get('user-agent') || null,
        last_used_at: new Date().toISOString(),
      }, { onConflict: 'endpoint' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to register push subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/push/subscribe
// Removes a subscription (endpoint) — e.g. when a device is replaced.
export async function DELETE(req: NextRequest) {
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

    const { endpoint } = await req.json()
    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint is required' }, { status: 400 })
    }

    const { error } = await (supabase as any)
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to remove push subscription' },
      { status: 500 }
    )
  }
}
