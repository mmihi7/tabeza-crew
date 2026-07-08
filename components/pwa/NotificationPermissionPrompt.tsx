'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported'
type PromptVisibility = 'hidden' | 'visible' | 'dismissed'

export function NotificationPermissionPrompt() {
  const [perm, setPerm] = useState<PermissionState>('prompt')
  const [visibility, setVisibility] = useState<PromptVisibility>('hidden')

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!('Notification' in window)) {
      setPerm('unsupported')
      return
    }

    if (Notification.permission === 'granted') {
      setPerm('granted')
    } else if (Notification.permission === 'denied') {
      setPerm('denied')
    } else {
      // Wait a moment before showing the prompt
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem('tabeza_notification_dismissed')
        if (dismissed !== 'true') {
          setVisibility('visible')
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  async function handleEnable() {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setPerm('granted')
        setVisibility('dismissed')
      } else {
        setPerm('denied')
      }
    } catch {
      setPerm('denied')
    }
  }

  function handleDismiss() {
    setVisibility('dismissed')
    localStorage.setItem('tabeza_notification_dismissed', 'true')
  }

  // Don't render if already granted, unsupported, or dismissed
  if (visibility !== 'visible') return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(72px + 0.75rem)',
        left: '0.75rem',
        right: '0.75rem',
        maxWidth: 400,
        margin: '0 auto',
        zIndex: 100,
        background: 'var(--background-primary)',
        border: '1px solid var(--border-default)',
        borderRadius: '0.875rem',
        padding: '1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* Close button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--background-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <X size={14} style={{ color: 'var(--text-tertiary)' }} />
      </button>

      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '0.75rem',
            background: 'var(--amber-pale)',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Bell size={20} style={{ color: 'var(--amber)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
            Get notified about shifts
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {perm === 'denied'
              ? 'Notifications are blocked. Enable them in your browser settings to receive instant shift offers.'
              : 'Allow notifications to receive instant alerts when venues send you shift offers or when your applications are accepted.'
            }
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleDismiss}
          style={{
            flex: 1,
            padding: '0.6rem',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            background: 'var(--background-secondary)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          {perm === 'denied' ? 'Got it' : 'Not now'}
        </button>
        {perm !== 'denied' && (
          <button
            onClick={handleEnable}
            style={{
              flex: 2,
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: 'var(--amber)',
              border: 'none',
              color: '#1a1a2e',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
            }}
          >
            <Bell size={15} />
            Enable Notifications
          </button>
        )}
      </div>
    </div>
  )
}
