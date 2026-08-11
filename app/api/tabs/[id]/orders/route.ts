import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

type Params = Promise<{ id: string }>

// GET /api/tabs/[id]/orders — returns order history for a tab (read-only)
export async function GET(req: NextRequest, segment: { params: Params }) {
  const { id } = await segment.params
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: orders, error } = await (supabase as any)
      .from('tab_orders')
      .select('id, items, total, status, created_at, approved_by_customer_at')
      .eq('tab_id', id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw new Error(error.message)

    return NextResponse.json({
      orders: (orders ?? []).map((o: any) => ({
        id: o.id,
        items: o.items || '',
        total: parseFloat(o.total) || 0,
        status: o.status,
        createdAt: o.created_at,
        approvedAt: o.approved_by_customer_at,
      }))
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
