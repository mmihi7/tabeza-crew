import { supabase } from '@/lib/supabase'

// Fetch the .ics for a shift and trigger a download so the crew member
// can add it to their phone/desktop calendar.
export async function downloadShiftICS(shiftId: string): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return false

    const res = await fetch(`/api/calendar?shiftId=${encodeURIComponent(shiftId)}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (!res.ok) return false

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tabeza-shift-${shiftId.slice(0, 8)}.ics`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    return true
  } catch {
    return false
  }
}
