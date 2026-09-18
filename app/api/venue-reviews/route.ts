// POST /api/venue-reviews
// Crew submit a reputation review of a venue after an ended shift.
//
// Body: { shift_id, rating, comment? }
//   - `rating` is a single overall score 1-5. Legacy callers may still send
//     payout_reliability/treatment/shifts_available, which are averaged into
//     one overall rating.
//   - bar_id and verified_paid are derived server-side from the shift row,
//     so a crew member can never review a venue they didn't work for.
//
// The legacy crew_venue_reviews columns are all written with the same overall
// rating so existing aggregates keep working; only the overall score is shown.
//
// Insert is service-role (bypasses RLS). The venue_crew_metrics rollup is
// recomputed by the DB trigger on crew_venue_reviews.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

const clamp = (v: number) => Math.max(1, Math.min(5, Math.round(v)))

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shift_id, rating, payout_reliability, treatment, shifts_available, comment } = body ?? {}

    if (!shift_id) {
      return NextResponse.json({ error: 'shift_id is required' }, { status: 400 })
    }

    // Resolve a single overall rating (new `rating`, or average of legacy three)
    const legacy = [payout_reliability, treatment, shifts_available]
    const hasLegacy = legacy.every(
      (n) => typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 5
    )
    const overall =
      typeof rating === 'number' && Number.isFinite(rating) && rating >= 1 && rating <= 5
        ? rating
        : hasLegacy
          ? (payout_reliability + treatment + shifts_available) / 3
          : null

    if (overall === null) {
      return NextResponse.json({ error: 'rating must be a number 1-5' }, { status: 400 })
    }

    // ── Identify the crew member ───────────────────────────────────────
    const supabase = createServiceRoleClient()
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

    let crewMemberId: string | null = null
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user?.id) {
        const { data: crew } = await (supabase as any)
          .from('crew_members')
          .select('id')
          .eq('user_id', user.id)
          .single()
        crewMemberId = crew?.id ?? null
      }
    }

    if (!crewMemberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Load the shift and validate ownership + eligibility ────────────
    const { data: shift, error: shiftError } = await (supabase as any)
      .from('shifts')
      .select('id, bar_id, crew_member_id, pay_amount, status')
      .eq('id', shift_id)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    // Only the crew member who worked the shift may review it
    if (shift.crew_member_id !== crewMemberId) {
      return NextResponse.json({ error: 'Forbidden: not your shift' }, { status: 403 })
    }

    // Only review ended shifts (no pre-emptive ratings)
    if (shift.status !== 'ended') {
      return NextResponse.json({ error: 'Shift must be ended before reviewing' }, { status: 409 })
    }

    // Dedup is enforced by the (crew_member_id, shift_id) unique index.
    const { data, error } = await (supabase as any)
      .from('crew_venue_reviews')
      .insert({
        crew_member_id: crewMemberId,
        bar_id: shift.bar_id,
        shift_id: shift.id,
        payout_reliability: clamp(overall),
        treatment: clamp(overall),
        shifts_available: clamp(overall),
        verified_paid: !!shift.pay_amount && shift.pay_amount > 0,
        comment: comment && typeof comment === 'string' ? comment.slice(0, 2000) : null,
      })
      .select('id, created_at')
      .single()

    if (error) {
      // Handle duplicate reviews gracefully
      if ((error as any).code === '23505') {
        return NextResponse.json({ error: 'Shift already reviewed' }, { status: 409 })
      }
      console.error('[venue-reviews] insert error:', error)
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
    }

    return NextResponse.json({ review: data }, { status: 201 })
  } catch (err) {
    console.error('[venue-reviews] unhandled:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
