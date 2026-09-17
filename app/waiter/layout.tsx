'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { BottomTabNav } from '@/components/layout/BottomTabNav'
import { NotificationPermissionPrompt } from '@/components/pwa/NotificationPermissionPrompt'
import { PushSubscriptionManager } from '@/components/pwa/PushSubscriptionManager'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Clock, MapPin } from 'lucide-react'

const STORAGE_KEY = 'tabeza-shift-confirmed'

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [crewMemberId, setCrewMemberId] = useState<string | null>(null)
  const [activeShift, setActiveShift] = useState<any>(null)
  const [urgencyShift, setUrgencyShift] = useState<any>(null)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const urgencyDismissed = useRef<string | null>(null)

  const isOnTabsPage = pathname.startsWith('/waiter/tabs')
  const isOnCheckinPage = pathname.startsWith('/waiter/checkin')

  // Load crew member ID + check for already-active shift on mount
  useEffect(() => {
    if (!user?.id) return
    const liveSince = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    ;(supabase as any)
      .from('crew_members')
      .select('id')
      .eq('user_id', user.id)
      .single()
      .then(async ({ data }: any) => {
        if (!data?.id) return
        setCrewMemberId(data.id)
        const { data: shifts } = await (supabase as any)
          .from('shifts')
          .select('id, status, checked_in_at, role, shift_start, shift_end, bar:bars(id, name)')
          .eq('crew_member_id', data.id)
          .in('status', ['active', 'ending_soon'])
          .or(`shift_end.is.null,shift_end.gt.${liveSince}`)
          .order('shift_start', { ascending: false })
          .limit(1)
        const shift = shifts?.[0]
        if (!shift) return
        setActiveShift(shift)
        if (!isOnCheckinPage && !isOnTabsPage) {
          const confirmed = localStorage.getItem(`${STORAGE_KEY}-${shift.id}`)
          if (confirmed || shift.checked_in_at) {
            if (!confirmed) localStorage.setItem(`${STORAGE_KEY}-${shift.id}`, 'true')
            router.replace('/waiter/tabs')
          } else {
            router.replace('/waiter/checkin')
          }
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Poll the active shift so the "On shift" banner cannot go stale if a
  // realtime event is missed (e.g. ending_soon → ended, or a venue manual close).
  useEffect(() => {
    if (!crewMemberId) return
    let cancelled = false

    const refresh = async () => {
      const liveSince = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const { data: shifts } = await (supabase as any)
        .from('shifts')
        .select('id, status, checked_in_at, role, shift_start, shift_end, bar:bars(id, name)')
        .eq('crew_member_id', crewMemberId)
        .in('status', ['active', 'ending_soon'])
        .or(`shift_end.is.null,shift_end.gt.${liveSince}`)
        .order('shift_start', { ascending: false })
        .limit(1)
      if (cancelled) return
      setActiveShift(shifts?.[0] ?? null)
    }

    const interval = setInterval(refresh, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [crewMemberId])

  // Check-in urgency: detect scheduled shifts that have started
  useEffect(() => {
    if (!crewMemberId) return
    if (isOnTabsPage || isOnCheckinPage) return

    let isActive = true
    const check = async () => {
      if (!isActive) return
      const { data: shifts } = await (supabase as any)
        .from('shifts')
        .select('id, shift_start, shift_end, role, status, checked_in_at, bar:bars(name)')
        .eq('crew_member_id', crewMemberId)
        .eq('status', 'scheduled')
        .order('shift_start', { ascending: true })
        .limit(1)

      const shift = shifts?.[0]
      if (!shift || shift.checked_in_at) return
      if (shift.id === urgencyDismissed.current) return

      const now = Date.now()
      const start = new Date(shift.shift_start).getTime()
      const end = new Date(shift.shift_end).getTime()
      const inWindow = now >= start - 30 * 60 * 1000 && now <= end

      if (inWindow && !shift.checked_in_at) {
        setUrgencyShift(shift)
      }
    }

    check()
    const interval = setInterval(check, 30000)
    return () => { isActive = false; clearInterval(interval) }
  }, [crewMemberId, isOnTabsPage, isOnCheckinPage])

  async function handleUrgentCheckin() {
    if (!urgencyShift?.id) return
    setCheckinLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) return
      const res = await fetch('/api/shifts/checkin-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shiftId: urgencyShift.id }),
      })
      if (res.ok) {
        setUrgencyShift(null)
        router.replace('/waiter/checkin')
      }
    } catch {} finally {
      setCheckinLoading(false)
    }
  }

  function dismissUrgency() {
    urgencyDismissed.current = urgencyShift?.id || null
    setUrgencyShift(null)
    setTimeout(() => { urgencyDismissed.current = null }, 120000)
  }

  // Realtime: detect when staff checks crew in — auto-open venue page
  useEffect(() => {
    if (!crewMemberId) return
    const channel = supabase.channel(`layout-shift-${crewMemberId}`)
    channel.on('postgres_changes' as any, {
      event: 'UPDATE',
      schema: 'public',
      table: 'shifts',
      filter: `crew_member_id=eq.${crewMemberId}`,
    }, (payload: any) => {
      const shiftId = payload.new?.id
      const newStatus = payload.new?.status
      const isLive = newStatus === 'active' || newStatus === 'ending_soon'
      // Keep the banner in sync for ANY status change — not just active → ended.
      // A missed ending_soon → ended transition used to leave a stale banner.
      setActiveShift(isLive ? payload.new : null)
      if (newStatus === 'active' && shiftId) {
        if (!isOnCheckinPage && !isOnTabsPage) {
          const confirmed = localStorage.getItem(`${STORAGE_KEY}-${shiftId}`)
          router.replace(confirmed ? '/waiter/tabs' : '/waiter/checkin')
        }
      }
    })
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [crewMemberId, isOnCheckinPage, isOnTabsPage, router])

  useEffect(() => {
    // Once the auth state is resolved, redirect if not signed in
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [loading, user, router])

  // Show nothing while checking session to avoid flash of protected content
  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--background-primary)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid var(--border-default)',
          borderTopColor: 'var(--amber)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Not authenticated — render nothing while redirecting
  if (!user) return null

  return (
    <>
      <main className="page-wrapper">{children}</main>

      {/* ── Urgency Modal: shift has started, check in now ─────── */}
      {urgencyShift && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease',
        }} onClick={dismissUrgency}>
          <div style={{
            background: 'var(--ink-2)', border: '1px solid var(--border)',
            borderRadius: '1.25rem', padding: '2rem 1.5rem',
            maxWidth: 360, width: '90%', textAlign: 'center',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }} onClick={e => e.stopPropagation()}>
            {/* Pulsing icon */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 1rem',
              background: '#cc0000', display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 1s infinite',
            }}>
              <Clock size={28} style={{ color: '#fff' }} />
            </div>

            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cream)', marginBottom: '0.25rem' }}>
              Your shift has started!
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              at <strong style={{ color: 'var(--cream)' }}>{urgencyShift.bar?.name || 'venue'}</strong>
            </p>

            {/* Shift details */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem',
              padding: '0.75rem', marginBottom: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                <MapPin size={14} />
                <span>{urgencyShift.role}</span>
                <span>·</span>
                <span>{new Date(urgencyShift.shift_start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} – {new Date(urgencyShift.shift_end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleUrgentCheckin}
              disabled={checkinLoading}
              style={{
                width: '100%', padding: '0.875rem',
                background: checkinLoading ? 'rgba(204,0,0,0.5)' : '#cc0000',
                border: 'none', borderRadius: '0.75rem',
                color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                cursor: checkinLoading ? 'not-allowed' : 'pointer',
                marginBottom: '0.5rem',
                animation: 'pulse 1s infinite',
              }}
            >
              {checkinLoading ? 'Requesting...' : 'Check In Now'}
            </button>
            <button
              onClick={dismissUrgency}
              style={{
                width: '100%', padding: '0.75rem',
                background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                borderRadius: '0.75rem', color: 'var(--muted)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              I&apos;ll check in later
            </button>
          </div>
        </div>
      )}

      {activeShift && !isOnTabsPage && !isOnCheckinPage && (
        <div style={{
          position: 'fixed', bottom: '72px', left: 0, right: 0, zIndex: 50,
          padding: '0.5rem 1rem', background: 'var(--amber)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: 'var(--ink)', animation: 'pulse 1.5s infinite',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)' }}>
            On shift at {activeShift?.bar?.name || 'venue'}
          </span>
          <button onClick={() => router.push('/waiter/tabs')} style={{
            padding: '0.3rem 0.75rem', borderRadius: '0.5rem',
            background: 'var(--ink)', border: 'none', color: 'var(--cream)',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
          }}>
            View Tabs
          </button>
        </div>
      )}
      <NotificationPermissionPrompt />
      <PushSubscriptionManager />
      <BottomTabNav />
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.8) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </>
  )
}
