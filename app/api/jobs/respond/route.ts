import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

// POST /api/jobs/respond
// Accept or decline a hire request from a venue
//
// Body:
//   hireRequestId: string   — the hire_request UUID
//   action: 'accepted' | 'declined'
//   responseMessage?: string — decline reason (optional)
//
// The database trigger notify_venue_on_hire_response() will automatically:
//   - Create a venue_notifications row for the venue managers
//   - If accepted, the trigger also expects a resulting_shift_id to be set

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { hireRequestId, action, responseMessage } = body

    // ── Validate input ────────────────────────────────────────────────
    if (!hireRequestId || !action) {
      return NextResponse.json(
        { error: 'hireRequestId and action are required' },
        { status: 400 }
      )
    }

    if (!['accepted', 'declined'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "accepted" or "declined"' },
        { status: 400 }
      )
    }

    if (action === 'declined' && responseMessage && responseMessage.length > 500) {
      return NextResponse.json(
        { error: 'Response message must be under 500 characters' },
        { status: 400 }
      )
    }

    // ── Authenticate ──────────────────────────────────────────────────
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

    // ── Get crew member record ────────────────────────────────────────
    const { data: crewMember } = await (supabase as any)
      .from('crew_members')
      .select('id, display_name')
      .eq('user_id', user.id)
      .single()

    if (!crewMember?.id) {
      return NextResponse.json({ error: 'Crew profile not found' }, { status: 404 })
    }

    // ── Fetch the hire request to verify ownership ────────────────────
    const { data: hireRequest, error: fetchError } = await (supabase as any)
      .from('hire_requests')
      .select(`
        id, crew_member_id, bar_id, status, role,
        shift_date, shift_start, shift_end, pay_amount, pay_currency,
        expires_at, sent_at, requested_by
      `)
      .eq('id', hireRequestId)
      .single()

    if (fetchError || !hireRequest) {
      return NextResponse.json({ error: 'Hire request not found' }, { status: 404 })
    }

    // ── Verify this hire request belongs to this crew member ──────────
    if (hireRequest.crew_member_id !== crewMember.id) {
      return NextResponse.json({ error: 'Forbidden — this request is not for you' }, { status: 403 })
    }

    // ── Validate status ──────────────────────────────────────────────
    if (hireRequest.status !== 'pending') {
      const statusMap: Record<string, string> = {
        accepted: 'already accepted',
        declined: 'already declined',
        expired: 'already expired',
        cancelled: 'was cancelled by the venue',
      }
      return NextResponse.json(
        { error: `Cannot respond — this request has ${statusMap[hireRequest.status] || 'been processed'}` },
        { status: 409 }
      )
    }

    // ── Check expiration ─────────────────────────────────────────────
    const now = new Date()
    const expiresAt = new Date(hireRequest.expires_at)
    if (now > expiresAt) {
      // Auto-expire it in the database
      await (supabase as any)
        .from('hire_requests')
        .update({
          status: 'expired',
          responded_at: now.toISOString(),
        })
        .eq('id', hireRequestId)

      return NextResponse.json(
        { error: 'This hire request has expired' },
        { status: 410 }
      )
    }

    // ── Process the response ─────────────────────────────────────────
    const nowISO = now.toISOString()
    const updateData: Record<string, any> = {
      status: action,
      responded_at: nowISO,
    }

    if (action === 'declined' && responseMessage) {
      updateData.response_message = responseMessage
    }

    // If accepting, create a scheduled shift first
    let createdShiftId: string | null = null

    if (action === 'accepted') {
      // Combine shift_date with shift_start and shift_end to create proper timestamps
      const shiftStart = `${hireRequest.shift_date}T${hireRequest.shift_start}+03:00`
      const shiftEnd = `${hireRequest.shift_date}T${hireRequest.shift_end}+03:00`
      
      const { data: shift, error: shiftError } = await (supabase as any)
        .from('shifts')
        .insert({
          bar_id: hireRequest.bar_id,
          crew_member_id: crewMember.id,
          role: hireRequest.role,
          shift_start: shiftStart,
          shift_end: shiftEnd,
          created_by: hireRequest.requested_by,
          status: 'scheduled',
        })
        .select('id')
        .single()

      if (shiftError) {
        console.error('[/api/jobs/respond] Shift creation error:', shiftError.message)
        console.error('[/api/jobs/respond] Shift error details:', shiftError)
        return NextResponse.json(
          { error: `Failed to create shift: ${shiftError.message}` },
          { status: 500 }
        )
      }

      createdShiftId = shift.id
      updateData.resulting_shift_id = shift.id
    }

    // Update the hire request
    const { error: updateError } = await (supabase as any)
      .from('hire_requests')
      .update(updateData)
      .eq('id', hireRequestId)

    if (updateError) {
      console.error('[/api/jobs/respond] Hire request update error:', updateError.message)
      console.error('[/api/jobs/respond] Update error details:', updateError)
      // Rollback: delete the shift if hire request update failed
      if (createdShiftId) {
        await (supabase as any)
          .from('shifts')
          .delete()
          .eq('id', createdShiftId)
      }

      return NextResponse.json(
        { error: `Failed to update hire request: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      action,
      shiftId: createdShiftId,
      message: action === 'accepted'
        ? 'You have accepted this shift'
        : 'You have declined this shift',
    })

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to respond to hire request' },
      { status: 500 }
    )
  }
}
