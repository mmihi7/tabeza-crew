'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface UnreadCounts {
  notifications: number   // unread crew_notifications
  hireRequests:  number   // pending hire_requests
}

/**
 * Fetches unread notification count and pending hire request count
 * for the authenticated crew member. Refreshes when user changes.
 */
export function useUnreadCounts(): UnreadCounts {
  const { user } = useAuth()
  const [counts, setCounts] = useState<UnreadCounts>({ notifications: 0, hireRequests: 0 })

  useEffect(() => {
    if (!user?.id) return

    async function load() {
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

        setCounts({
          notifications: unreadNotifications,
          hireRequests:  pendingHireRequests,
        })
      } catch {
        // Non-fatal — badge just won't show
      }
    }

    load()
  }, [user?.id])

  return counts
}
