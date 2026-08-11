import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

type Params = Promise<{ id: string }>

// GET /api/tabs/[id] — returns single tab detail
export async function GET(req: NextRequest, segment: { params: Params }) {
  const { id } = await segment.params
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: tab } = await (supabase as any)
      .from('tabs')
      .select(`
        id,
        tab_number,
        current_balance,
        status,
        customer_id,
        notes,
        created_at,
        bar:bars(id, name, display_name)
      `)
      .eq('id', id)
      .single()

    if (!tab) return NextResponse.json({ error: 'Tab not found' }, { status: 404 })

    let displayName = `Tab #${tab.tab_number}`
    if (tab.customer_id) {
      const { data: cust } = await (supabase as any)
        .from('customers')
        .select('display_name, email')
        .eq('id', tab.customer_id)
        .maybeSingle()
      if (cust?.display_name) displayName = `${cust.display_name} (#${tab.tab_number})`
      else if (cust?.email) displayName = `${cust.email.split('@')[0]} (#${tab.tab_number})`
    }

    return NextResponse.json({
      tab: {
        id: tab.id,
        tabNumber: tab.tab_number,
        displayName,
        balance: tab.current_balance || 0,
        status: tab.status,
        notes: tab.notes,
        createdAt: tab.created_at,
        barName: tab.bar?.display_name || tab.bar?.name || '',
        barId: tab.bar?.id,
      }
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch tab' },
      { status: 500 }
    )
  }
}
