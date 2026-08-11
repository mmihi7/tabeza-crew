import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'
import { fetchOrCache, crewShiftsKey } from '@/lib/cache'

// GET /api/tabs — returns all assigned tabs for the crew member
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: staff } = await (supabase as any)
      .from('crew_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!staff?.id) return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })

    const result = await fetchOrCache(`crew:tabs:${staff.id}`, async () => {
      const { data: assignments, error } = await (supabase as any)
        .from('tab_assignments')
        .select(`
          id,
          tab_id,
          assigned_at,
          is_current,
          tab:tabs(
            id,
            tab_number,
            current_balance,
            status,
            customer_id,
            notes,
            created_at,
            bar:bars(id, name, display_name)
          )
        `)
        .eq('crew_member_id', staff.id)
        .eq('is_current', true)

      if (error) throw new Error(error.message)

      const tabs = await Promise.all((assignments ?? []).map(async (a: any) => {
        const t = a.tab
        if (!t) return null

        let displayName = `Tab #${t.tab_number}`
        if (t.customer_id) {
          const { data: cust } = await (supabase as any)
            .from('customers')
            .select('display_name, email')
            .eq('id', t.customer_id)
            .maybeSingle()
          if (cust?.display_name) displayName = `${cust.display_name} (#${t.tab_number})`
          else if (cust?.email) displayName = `${cust.email.split('@')[0]} (#${t.tab_number})`
        }

        const { count: orderCount } = await (supabase as any)
          .from('tab_orders')
          .select('*', { count: 'exact', head: true })
          .eq('tab_id', t.id)
          .eq('status', 'confirmed')

        return {
          id: a.id,
          tabId: t.id,
          tabNumber: t.tab_number,
          displayName,
          balance: t.current_balance || 0,
          status: t.status,
          orderCount: orderCount || 0,
          barName: t.bar?.display_name || t.bar?.name || '',
          barId: t.bar?.id,
          assignedAt: a.assigned_at,
        }
      }))

      return { tabs: tabs.filter(Boolean) }
    }, 15)

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch tabs' },
      { status: 500 }
    )
  }
}
