// GET /api/venues/[id]
// Crew-facing public venue intelligence: business facts + menu preview +
// aggregated crew reputation (payout reliability, treatment, availability).
// Mirrors the canonical staff route against the same Supabase tables. No auth
// required — a waitress/waiter can read venue reputation before taking a shift.
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceRoleClient()

    const { data: bar, error: barError } = await (supabase as any)
      .from('bars')
      .select(
        'id, name, address, location, area, latitude, longitude, ' +
        'logo_url, phone, business_hours_simple, business_hours_mode, ' +
        'show_customer_menu, menu_plan'
      )
      .eq('id', id)
      .single()

    if (barError || !bar) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const { data: menu } = await (supabase as any)
      .from('bar_products')
      .select('id, name, description, category, image_url, sale_price, is_promo')
      .eq('bar_id', id)
      .eq('active', true)
      .order('name', { ascending: true })
      .limit(20)

    const { data: metrics } = await (supabase as any)
      .from('venue_crew_metrics')
      .select('avg_payout_reliability, avg_treatment, avg_shifts_available, review_count')
      .eq('bar_id', id)
      .single()

    return NextResponse.json({
      venue: {
        id: bar.id,
        name: bar.name,
        address: bar.address,
        location: bar.location,
        area: bar.area,
        latitude: bar.latitude,
        longitude: bar.longitude,
        logo_url: bar.logo_url,
        phone: bar.phone,
        business_hours_mode: bar.business_hours_mode,
        business_hours_simple: bar.business_hours_simple,
      },
      menu: (menu ?? []).map((m: any) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        category: m.category,
        image_url: m.image_url,
        sale_price: m.sale_price,
        is_promo: m.is_promo,
      })),
      crew: metrics
        ? {
            avg_payout_reliability: metrics.avg_payout_reliability,
            avg_treatment: metrics.avg_treatment,
            avg_shifts_available: metrics.avg_shifts_available,
            review_count: metrics.review_count,
          }
        : {
            avg_payout_reliability: 0,
            avg_treatment: 0,
            avg_shifts_available: 0,
            review_count: 0,
          },
    })
  } catch (err) {
    console.error('[venues] unhandled:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
