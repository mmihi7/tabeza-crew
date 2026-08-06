import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeICS(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// GET /api/calendar?shiftId=<id>
// Returns an .ics file for a single scheduled shift so the crew member
// can add it to their phone/desktop calendar.
export async function GET(req: NextRequest) {
  try {
    const shiftId = req.nextUrl.searchParams.get('shiftId')

    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!shiftId) {
      return NextResponse.json({ error: 'shiftId is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: crew } = await (supabase as any)
      .from('crew_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!crew?.id) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })
    }

    const { data: shift, error } = await (supabase as any)
      .from('shifts')
      .select(`
        id,
        role,
        shift_start,
        shift_end,
        pay_amount,
        bar:bars(id, name, display_name, address)
      `)
      .eq('id', shiftId)
      .eq('crew_member_id', crew.id)
      .eq('status', 'scheduled')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const venueName = shift.bar?.display_name || shift.bar?.name || 'Venue'
    const venueAddress = shift.bar?.address || ''
    const start = new Date(shift.shift_start)
    const end = new Date(shift.shift_end)
    const now = new Date()

    const summary = `Shift at ${venueName}`
    const description = [
      `Role: ${shift.role || 'Staff'}`,
      shift.pay_amount != null ? `Pay: KES ${Number(shift.pay_amount).toLocaleString()}` : null,
      venueAddress ? `Address: ${venueAddress}` : null,
    ].filter(Boolean).join('\n')

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Tabeza//Tabeza Crew//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:shift-${shift.id}@tabeza.co.ke`,
      `DTSTAMP:${formatICSDate(now)}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${escapeICS(summary)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      venueAddress ? `LOCATION:${escapeICS(venueAddress)}` : null,
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n')

    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="shift-${shift.id}.ics"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate calendar file' },
      { status: 500 }
    )
  }
}
