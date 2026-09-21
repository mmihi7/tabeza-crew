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
export function useUnreadCounts(options: { subscribe?: boolean } = {}) {
  const { subscribe = true } = options
  const { user, getSession } = useAuth()
  const [counts, setCounts] = useState<UnreadCounts>({ notifications: 0, hireRequests: 0 })
  const [crewMemberId, setCrewMemberId] = useState<string | null>(null)
  const [subscriptionsReady, setSubscriptionsReady] = useState(false)
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
      const session = getSession()
      const token = session?.access_token
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
  }, [user?.id, crewMemberId, getSession])

  // ── Notify function for external calls ──────────────────────────────
  const notifyCountsChanged = useCallback(() => {
    // Dispatch a custom event that our hook listens for
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(REFRESH_COUNTS_EVENT))
    }
  }, [])

  // Keep the latest refresh without re-subscribing realtime channels on every
  // render (a changing `refresh` identity used to churn the channels).
  const refreshRef = useRef(refresh)
  useEffect(() => {
    refreshRef.current = refresh
  }, [refresh])

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

  // ── Defer realtime subscriptions until after initial render ────────
  useEffect(() => {
    if (!subscribe || !crewMemberId) return
    let id: any
    if (window.requestIdleCallback) {
      id = window.requestIdleCallback(() => {
        if (isMounted.current) setSubscriptionsReady(true)
      })
    } else {
      id = setTimeout(() => {
        if (isMounted.current) setSubscriptionsReady(true)
      }, 1000)
    }
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id)
      else clearTimeout(id)
    }
  }, [subscribe, crewMemberId])

  // ── Realtime subscription for hire_requests ────────────────────────
  // Each run gets a unique topic: supabase.channel() returns the existing
  // channel for a duplicate topic, so re-subscribing before removeChannel
  // settles would throw "cannot add callbacks after subscribe()".
  useEffect(() => {
    if (!subscribe || !crewMemberId || !subscriptionsReady) return

    const channel = supabase.channel(`unread-hire-${crewMemberId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`)
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
          refreshRef.current()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [subscribe, crewMemberId, subscriptionsReady])

  // ── Realtime subscription for crew_notifications ────────────────────
  useEffect(() => {
    if (!subscribe || !crewMemberId || !subscriptionsReady) return

    const channel = supabase.channel(`unread-notif-${crewMemberId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`)
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
          refreshRef.current()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [subscribe, crewMemberId, subscriptionsReady])

  return {
    ...counts,
    refresh,              // Expose refresh for manual triggering
    notifyCountsChanged,  // Expose notify for external components to trigger refresh
  }
}