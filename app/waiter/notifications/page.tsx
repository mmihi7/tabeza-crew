'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BellOff, CheckCircle, XCircle, Loader } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import { useUnreadCounts } from '@/hooks/useUnreadCounts' // ✅ Import for notification updates
import type { Notification } from '@/lib/types'

const PRIORITY_CONFIG: Record<string, { dot: string; label: string; bg: string; border: string }> = {
  urgent: { dot: 'var(--error)',   label: 'Urgent',  bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.20)'   },
  high:   { dot: 'var(--amber)',   label: 'High',    bg: 'rgba(200,134,26,0.08)',   border: 'rgba(200,134,26,0.20)'  },
  normal: { dot: 'var(--info)',    label: '',        bg: 'var(--background-secondary)', border: 'var(--border-default)' },
  low:    { dot: 'var(--border-default)', label: '', bg: 'var(--background-secondary)', border: 'var(--border-default)' },
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1)  return 'just now'
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ago`
}

export default function NotificationsPage() {
  const router = useRouter()
  const { notifyCountsChanged } = useUnreadCounts() // ✅ Get notification function
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [crewMemberId, setCrewMemberId] = useState<string | null>(null)
  // hire request inline action state: notif.id → 'responding' | 'accepted' | 'declined' | error string
  const [hireActionState, setHireActionState] = useState<Record<string, string>>({})
  // ✅ Track pending hire request IDs from /api/jobs
  const [pendingHireRequestIds, setPendingHireRequestIds] = useState<Set<string>>(new Set())

  // ── Load crew member ID on mount ────────────────────────────
  useEffect(() => {
    async function getCrewId() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: crew } = await (supabase as any)
        .from('crew_members')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (crew?.id) setCrewMemberId(crew.id)
    }
    getCrewId()
  }, [])

  // ── Load pending hire request IDs ────────────────────────────
  const loadPendingHireRequestIds = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) return
      
      const res = await fetch('/api/jobs', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await res.json()
      
      if (data.hireRequests) {
        const pendingIds = new Set<string>(
          (data.hireRequests as any[])
            .filter((r: any) => r.status === 'pending')
            .map((r: any) => r.id)
        )
        setPendingHireRequestIds(pendingIds)
      }
    } catch {
      // Silent fail — fallback to showing action buttons
    }
  }, [])

  // ── Load notifications from API ─────────────────────────────
  useEffect(() => {
    async function loadNotifications() {
      try {
        // Load pending hire requests first
        await loadPendingHireRequestIds()
        
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token
        if (!accessToken) return
        
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json()
        if (!data.notifications) return
        
        setNotifications(data.notifications)
        const alreadyRead = new Set<string>(
          data.notifications.filter((n: any) => n.readAt).map((n: any) => n.id)
        )
        setReadIds(alreadyRead)
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }
    loadNotifications()
  }, [loadPendingHireRequestIds])

  // ── Realtime: listen for new crew_notifications INSERTs ─────
  const handleNewNotification = useCallback((payload: any) => {
    const n = payload.new
    if (!n?.id) return
    const newNotif: Notification = {
      id: n.id,
      type: n.notification_type,
      notificationType: n.notification_type,
      title: n.title,
      body: n.body,
      priority: n.priority || 'normal',
      readAt: n.read_at,
      actionUrl: n.action_url,
      createdAt: n.created_at,
    }
    setNotifications(prev => {
      if (prev.some(existing => existing.id === newNotif.id)) return prev
      return [newNotif, ...prev]
    })
    // ✅ Notify that counts have changed
    notifyCountsChanged()
  }, [notifyCountsChanged])

  const { isConnected } = useRealtimeSubscription(
    crewMemberId
      ? [{
          channelName: `crew-notifications-${crewMemberId}`,
          table: 'crew_notifications',
          filter: `crew_member_id=eq.${crewMemberId}`,
          event: 'INSERT' as const,
          handler: handleNewNotification,
        }]
      : [],
    [crewMemberId]
  )

  // ── Generalized mark read function ──────────────────────────
  const markIdsRead = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) return
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ ids }),
      })
      setReadIds(prev => new Set([...prev, ...ids]))
      // ✅ Notify that counts have changed after marking read
      notifyCountsChanged()
    } catch { /* silent */ }
  }, [notifyCountsChanged])

  // ── Mark all read ────────────────────────────────────────────
  async function markAllRead() {
    const unreadIds = notifications.filter(n => !readIds.has(n.id)).map(n => n.id)
    await markIdsRead(unreadIds)
  }

  // ── Mark single read ──────────────────────────────────────────
  async function markRead(id: string) {
    await markIdsRead([id])
  }

  // ── Inline hire request response ────────────────────────────
  async function respondToHireRequest(notifId: string, hireRequestId: string, action: 'accepted' | 'declined') {
    setHireActionState(s => ({ ...s, [notifId]: 'responding' }))
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) { 
        setHireActionState(s => ({ ...s, [notifId]: 'Please sign in again' }))
        return
      }

      const res = await fetch('/api/jobs/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ hireRequestId, action }),
      })
      const data = await res.json()
      if (!res.ok) {
        setHireActionState(s => ({ ...s, [notifId]: data.error || 'Something went wrong' }))
        return
      }
      
      setHireActionState(s => ({ ...s, [notifId]: action }))
      
      // ✅ Mark notification as read
      await markRead(notifId)
      
      // ✅ Refresh pending hire request set
      await loadPendingHireRequestIds()
      
      // ✅ Notify counts have changed
      notifyCountsChanged()
    } catch {
      setHireActionState(s => ({ ...s, [notifId]: 'Network error — try again' }))
    }
  }

  // ── Check if a hire request is still pending ────────────────
  const isHireRequestPending = useCallback((hireRequestId: string | undefined): boolean => {
    if (!hireRequestId) return false
    return pendingHireRequestIds.has(hireRequestId)
  }, [pendingHireRequestIds])

  // ── Auto-resolve resolved hire requests ──────────────────────
  useEffect(() => {
    // Find hire_request_received notifications that are:
    // 1. Not already read
    // 2. Have a relatedEntityId
    // 3. The relatedEntityId is NOT in pendingHireRequestIds
    const resolvedNotifIds: string[] = []
    
    notifications.forEach(n => {
      const notifType = n.notificationType || n.type
      if (notifType === 'hire_request_received' && !readIds.has(n.id)) {
        const relatedId = (n as any).relatedEntityId as string | undefined
        if (relatedId && !isHireRequestPending(relatedId)) {
          resolvedNotifIds.push(n.id)
        }
      }
    })
    
    // Auto-mark resolved notifications as read
    if (resolvedNotifIds.length > 0) {
      // Set local state immediately for UI feedback
      setReadIds(prev => new Set([...prev, ...resolvedNotifIds]))
      
      // Also send to server
      markIdsRead(resolvedNotifIds).catch(() => {
        // If server call fails, state is already updated locally
      })
    }
  }, [notifications, readIds, pendingHireRequestIds, isHireRequestPending, markIdsRead])

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: '0.5rem',
            background: 'var(--background-secondary)',
            border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Notifications
            {isConnected && (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} title="Live" />
            )}
            {unreadCount > 0 && (
              <span style={{ background: 'var(--error)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '999px' }}>
                {unreadCount}
              </span>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ fontSize: '0.75rem', color: 'var(--amber)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--border-default)', borderTopColor: 'var(--amber)', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <BellOff size={36} style={{ color: 'var(--text-tertiary)' }} />
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No notifications</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            New shift offers, order approvals, and tips will appear here
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.map(n => {
            const isRead = readIds.has(n.id)
            const config = PRIORITY_CONFIG[n.priority] || PRIORITY_CONFIG.normal
            const notifType = n.notificationType || n.type
            const isHireRequest = notifType === 'hire_request_received'
            const actionState = hireActionState[n.id]
            const alreadyActed = actionState === 'accepted' || actionState === 'declined'
            const isResponding = actionState === 'responding'
            const actionError = actionState && !['responding', 'accepted', 'declined'].includes(actionState) ? actionState : null

            // Get related entity ID
            const relatedEntityId = (n as any).relatedEntityId as string | undefined
            
            // ✅ Check if this hire request is still pending
            const isPending = isHireRequestPending(relatedEntityId)
            
            // ✅ Determine if we should show action buttons
            const showActionButtons = isHireRequest && !isRead && isPending && !alreadyActed && !isResponding

            return (
              <div
                key={n.id}
                style={{
                  padding: '0.875rem 1rem',
                  background: isRead ? 'var(--background-secondary)' : config.bg,
                  border: `1px solid ${isRead ? 'var(--border-default)' : config.border}`,
                  borderRadius: '0.75rem',
                  opacity: isRead && !isHireRequest ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', cursor: (!isHireRequest && n.actionUrl) ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (!isHireRequest) {
                      markRead(n.id)
                      if (n.actionUrl) router.push(n.actionUrl)
                    }
                  }}
                >
                  {/* Priority dot */}
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: isRead ? 'var(--border-default)' : config.dot,
                    flexShrink: 0, marginTop: 4,
                  }} />

                  <div style={{ flex: 1 }}>
                    {/* Notification type label */}
                    {!isRead && (
                      <div style={{
                        fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: notifType === 'hire_request_received' ? 'var(--amber)' :
                               notifType.startsWith('hire_request') ? 'var(--error)' :
                               notifType.startsWith('order') ? '#3b82f6' :
                               notifType.startsWith('tip') ? '#22c55e' : 'var(--text-tertiary)',
                        marginBottom: '0.2rem',
                      }}>
                        {notifType === 'hire_request_received'      && '📩 Hire Request'}
                        {notifType === 'hire_request_expiring_soon'  && '⏳ Offer Expiring'}
                        {notifType === 'hire_request_expired'        && '⌛ Offer Expired'}
                        {notifType === 'application_accepted'        && '✅ Application Accepted'}
                        {notifType === 'application_declined'        && '❌ Application Declined'}
                        {notifType === 'order_approved'              && '✅ Order Approved'}
                        {notifType === 'order_declined'              && '❌ Order Declined'}
                        {notifType === 'tip_received'                && '💵 Tip Received'}
                        {notifType === 'shift_ending_soon'           && '⏰ Shift Ending'}
                        {notifType === 'shift_ended_blocked'         && '🚫 Shift Ended'}
                        {notifType === 'checkout_unlocked'           && '🔓 Checkout Unlocked'}
                        {notifType === 'tab_assigned'                && '📋 Tab Assigned'}
                        {notifType === 'customer_reaction'           && '⭐ Customer Reaction'}
                        {!['hire_request_received','hire_request_expiring_soon','hire_request_expired',
                          'application_accepted','application_declined','order_approved','order_declined',
                          'tip_received','shift_ending_soon','shift_ended_blocked','checkout_unlocked',
                          'tab_assigned','customer_reaction'].includes(notifType) && notifType.replace(/_/g, ' ')}
                      </div>
                    )}

                    <div style={{ fontSize: '0.875rem', fontWeight: isRead ? 500 : 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.375rem' }}>
                      {n.body}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: isHireRequest && !alreadyActed ? '0.75rem' : 0 }}>
                      {timeAgo(n.createdAt)}
                    </div>

                    {/* ── Inline Accept / Decline for hire requests ── */}
                    {isHireRequest && (
                      <>
                        {/* ✅ Already acted via this component */}
                        {alreadyActed && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            fontSize: '0.8rem', fontWeight: 600,
                            color: actionState === 'accepted' ? 'var(--success)' : 'var(--error)',
                            marginTop: '0.5rem',
                          }}>
                            {actionState === 'accepted' ? <CheckCircle size={15} /> : <XCircle size={15} />}
                            {actionState === 'accepted' ? 'Shift accepted — check your schedule' : 'Offer declined'}
                          </div>
                        )}

                        {/* ✅ Already resolved elsewhere (other device or Jobs tab) */}
                        {!alreadyActed && !isPending && relatedEntityId && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            fontSize: '0.8rem', fontWeight: 600,
                            color: 'var(--text-secondary)',
                            marginTop: '0.5rem',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.5rem',
                            background: 'var(--background-tertiary)',
                            border: '1px solid var(--border-default)',
                          }}>
                            <CheckCircle size={15} style={{ color: 'var(--text-tertiary)' }} />
                            Already responded to elsewhere
                          </div>
                        )}

                        {actionError && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.375rem' }}>
                            {actionError}
                          </div>
                        )}

                        {/* ✅ Show action buttons only if still pending and not already acted */}
                        {showActionButtons && relatedEntityId && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              disabled={isResponding}
                              onClick={(e) => { e.stopPropagation(); respondToHireRequest(n.id, relatedEntityId, 'declined') }}
                              style={{
                                flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                fontSize: '0.8rem', fontWeight: 600, cursor: isResponding ? 'not-allowed' : 'pointer',
                                background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
                                color: 'var(--error)', opacity: isResponding ? 0.6 : 1,
                              }}
                            >
                              Decline
                            </button>
                            <button
                              disabled={isResponding}
                              onClick={(e) => { e.stopPropagation(); respondToHireRequest(n.id, relatedEntityId, 'accepted') }}
                              style={{
                                flex: 2, padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                fontSize: '0.8rem', fontWeight: 700, cursor: isResponding ? 'not-allowed' : 'pointer',
                                background: 'var(--amber)', border: 'none',
                                color: 'var(--ink)', opacity: isResponding ? 0.6 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                              }}
                            >
                              {isResponding
                                ? <Loader size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
                                : <CheckCircle size={13} />}
                              {isResponding ? 'Responding…' : 'Accept Shift'}
                            </button>
                          </div>
                        )}

                        {/* Fallback: no relatedEntityId — navigate to Jobs > Requests */}
                        {isHireRequest && !alreadyActed && !relatedEntityId && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markRead(n.id); router.push('/waiter/jobs') }}
                            style={{
                              width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                              background: 'var(--amber)', border: 'none', color: 'var(--ink)',
                            }}
                          >
                            View & Respond →
                          </button>
                        )}

                        {/* Already read + not yet acted: show link to Jobs */}
                        {isHireRequest && !alreadyActed && isRead && !isPending && (
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push('/waiter/jobs') }}
                            style={{
                              marginTop: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
                              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                              background: 'var(--background-tertiary)',
                              border: '1px solid var(--border-default)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            View in Jobs →
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}