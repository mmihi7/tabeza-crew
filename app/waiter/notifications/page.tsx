'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, BellOff } from 'lucide-react'
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data'
import type { Notification } from '@/lib/types'

const PRIORITY_CONFIG = {
  urgent: { dot: 'var(--error)',   label: 'Urgent',  bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.20)'   },
  high:   { dot: 'var(--amber)',   label: 'High',    bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.20)'  },
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
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  function markAllRead() {
    setReadIds(new Set(notifications.map(n => n.id)))
  }

  function markRead(id: string) {
    setReadIds(prev => new Set([...prev, id]))
  }

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
            {unreadCount > 0 && (
              <span
                style={{
                  background: 'var(--error)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '999px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              fontSize: '0.75rem',
              color: 'var(--amber)',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <BellOff size={36} style={{ color: 'var(--text-tertiary)' }} />
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            No notifications
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            New shift offers, order approvals, and tips will appear here
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.map(n => {
            const isRead = readIds.has(n.id)
            const config = PRIORITY_CONFIG[n.priority]

            return (
              <div
                key={n.id}
                onClick={() => {
                  markRead(n.id)
                  if (n.actionUrl) router.push(n.actionUrl)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  padding: '0.875rem 1rem',
                  background: isRead ? 'var(--background-secondary)' : config.bg,
                  border: `1px solid ${isRead ? 'var(--border-default)' : config.border}`,
                  borderRadius: '0.75rem',
                  cursor: n.actionUrl ? 'pointer' : 'default',
                  opacity: isRead ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Priority dot */}
                <div
                  style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: isRead ? 'var(--border-default)' : config.dot,
                    flexShrink: 0,
                    marginTop: 4,
                    transition: 'background 0.2s',
                  }}
                />

                <div style={{ flex: 1 }}>
                  {/* Priority label for urgent/high */}
                  {!isRead && config.label && (
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: n.priority === 'urgent' ? 'var(--error)' : 'var(--amber)', marginBottom: '0.2rem' }}>
                      {config.label}
                    </div>
                  )}
                  <div style={{ fontSize: '0.875rem', fontWeight: isRead ? 500 : 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.375rem' }}>
                    {n.body}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
