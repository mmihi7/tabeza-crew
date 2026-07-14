'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface UnreadCounts {
  notifications: number   // unread crew_notifications
  hireRequests:  number   // pending hire_requests
}

// Custom event name for cross-component communication
const REFRESH_COUNTS_EVENT = 'tabeza:refresh-counts'

/**
 * Fetches unread notification count and pending hire request count
 * for the authenticated crew member. Refreshes when user changes,
 * when notified via custom event, on window focus, and via realtime subscriptions.
 */
export function useUnreadCounts() {
  const { user } = useAuth()
  const [counts, setCounts] = useState<UnreadCounts>({ notifications: 0, hireRequests: 0 })
  const [crewMemberId, setCrewMemberId] = useState<string | null>(null)
  const isMounted = useRef(true)

  // ── Load crew member ID ──────────────────────────────────────────────
  useEffect(() => {
    async function getCrewId() {
      if (!user?.id) {
        setCrewMemberId(null)
        return
      }
      const { data: crew } = await (supabase as any)
        .from('crew_members')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (crew?.id) setCrewMemberId(crew.id)
    }
    getCrewId()
  }, [user?.id])

  // ── Fetch counts ─────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!user?.id || !crewMemberId) {
      setCounts({ notifications: 0, hireRequests: 0 })
      return
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) return

      // Fetch jobs (hire requests) and notifications in parallel
      const [jobsRes, notifRes] = await Promise.all([
        fetch('/api/jobs', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } }),
      ])

      const [jobsData, notifData] = await Promise.all([
        jobsRes.json(),
        notifRes.json(),
      ])

      const pendingHireRequests = (jobsData.hireRequests ?? []).filter(
        (r: any) => r.status === 'pending'
      ).length

      const unreadNotifications = (notifData.notifications ?? []).filter(
        (n: any) => !n.readAt
      ).length

      if (isMounted.current) {
        setCounts({
          notifications: unreadNotifications,
          hireRequests: pendingHireRequests,
        })
      }
    } catch {
      // Non-fatal — badge just won't show
    }
  }, [user?.id, crewMemberId])

  // ── Notify function for external calls ──────────────────────────────
  const notifyCountsChanged = useCallback(() => {
    // Dispatch a custom event that our hook listens for
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(REFRESH_COUNTS_EVENT))
    }
  }, [])

  // ── Initial load and refresh on user/crew change ──────────────────
  useEffect(() => {
    refresh()
  }, [refresh])

  // ── Listen for custom refresh event ──────────────────────────────
  useEffect(() => {
    const handler = () => {
      refresh()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener(REFRESH_COUNTS_EVENT, handler)
      return () => {
        window.removeEventListener(REFRESH_COUNTS_EVENT, handler)
      }
    }
  }, [refresh])

  // ── Refresh on window focus (catches changes from other tabs/devices) ──
  useEffect(() => {
    const handleFocus = () => {
      refresh()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      return () => {
        window.removeEventListener('focus', handleFocus)
      }
    }
  }, [refresh])

  // ── Realtime subscription for hire_requests ────────────────────────
  useEffect(() => {
    if (!crewMemberId) return

    const channel = supabase.channel(`unread-counts-hire-${crewMemberId}`)
    channel
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'hire_requests',
          filter: `crew_member_id=eq.${crewMemberId}`,
        },
        () => {
          // Any change to hire_requests for this crew member → refresh
          refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [crewMemberId, refresh])

  // ── Realtime subscription for crew_notifications ────────────────────
  useEffect(() => {
    if (!crewMemberId) return

    const channel = supabase.channel(`unread-counts-notif-${crewMemberId}`)
    channel
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'crew_notifications',
          filter: `crew_member_id=eq.${crewMemberId}`,
        },
        () => {
          // Any change to crew_notifications for this crew member → refresh
          refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [crewMemberId, refresh])

  return {
    ...counts,
    refresh,              // Expose refresh for manual triggering
    notifyCountsChanged,  // Expose notify for external components to trigger refresh
  }
}