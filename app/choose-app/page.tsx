'use client'

// /choose-app — shown when a signed-in user lands on the crew app but does
// NOT have a crew profile here (no crew_members record), while already
// belonging to another Tabeza app (staff, customer). They get to either join
// the crew (creating a crew profile) or continue to an app they already use.

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'

interface UserRole {
  type: 'staff' | 'crew' | 'customer' | 'tabeza'
  label: string
  description: string
  url: string
  barName?: string
}

// The only role that gives access to THIS app is `crew` (crew_members record).
const LOCAL_ROLES: UserRole['type'][] = ['crew']

// Friendly display name for each existing account kind.
const APP_LABEL: Record<string, string> = {
  crew:     'crew app',
  customer: 'customer app',
  staff:    'venue app',
  tabeza:   'Tabeza HQ',
}
const APP_NOUN: Record<string, string> = {
  crew:     'crew',
  customer: 'customer',
  staff:    'venue',
  tabeza:   'Tabeza HQ',
}

const PRIMARY_LABEL = 'Join the crew'

export default function ChooseAppPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ChooseAppInner />
    </Suspense>
  )
}

function ChooseAppInner() {
  const router = useRouter()
  const [roles, setRoles]           = useState<UserRole[]>([])
  const [loading, setLoading]       = useState(true)
  const [navigating, setNavigating] = useState<string | null>(null)
  const [error, setError]           = useState('')

  function isSelfApp(dest: string): boolean {
    if (dest.startsWith('/')) return true
    try { return new URL(dest).origin === window.location.origin } catch { return false }
  }

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/auth/login')
        return
      }

      const res = await fetch('/api/auth/roles', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        setError('Could not load your accounts. Please try again.')
        setLoading(false)
        return
      }

      const data = await res.json()

      // They already have a crew profile — send them to the crew app.
      if (data.roles.some((r: UserRole) => r.type === 'crew')) {
        router.replace('/waiter')
        return
      }

      const otherRoles = data.roles.filter((r: UserRole) => !LOCAL_ROLES.includes(r.type))

      // No other app to pivot to — the callback already created a crew profile.
      if (otherRoles.length === 0) {
        router.replace('/waiter')
        return
      }

      setRoles(otherRoles)
      setLoading(false)
    }

    load()
  }, [router])

  async function joinTheCrew() {
    setNavigating('crew')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const user = session.user
        await fetch('/api/staff/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({
            display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
            phone_number:  user.phone || user.email || '',
            location:      user.user_metadata?.location || '',
            latitude:      user.user_metadata?.latitude ?? null,
            longitude:     user.user_metadata?.longitude ?? null,
          }),
        })
      }
    } catch (err) {
      console.error('[choose-app] Failed to create crew_members record:', err)
    }
    router.push('/waiter')
  }

  function goTo(dest: string, key: string) {
    setNavigating(key)
    if (isSelfApp(dest)) router.push(dest)
    else window.location.href = dest
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  const target  = roles[0]?.type
  const noun    = target ? APP_NOUN[target] ?? 'Tabeza' : ''
  const label   = target ? APP_LABEL[target] ?? 'Tabeza' : ''
  const caption = roles.length === 1
    ? `You're signed in with a ${noun} account.`
    : 'You have more than one Tabeza account.'

  const heading = roles.length === 1
    ? `Join the crew, or go to your ${label}?`
    : roles.length > 1
      ? 'Join the crew, or go to an app you already use?'
      : 'Join the crew to get started.'

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--background-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <Logo size="xl" />

      {/* Heading — the brand question reads as one unit under the logo. */}
      <div style={{ textAlign: 'center', margin: '2.75rem 0 2.5rem', maxWidth: 420 }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.55 }}>
          {heading}
        </h1>
      </div>

      {error && (
        <div style={{ color: 'var(--error)', fontSize: '0.8rem', margin: '-1.5rem 0 1.75rem', maxWidth: 380, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Panel — one raised surface. Every direction carries equal weight. */}
      <div style={{ width: '100%', maxWidth: 380, background: 'var(--background-secondary)', border: '1px solid var(--border-default)', borderRadius: '0.75rem', padding: '0.5rem' }}>
        {[
          { key: 'crew', label: PRIMARY_LABEL, run: joinTheCrew },
          ...roles.map((role) => ({
            key: role.type,
            label: `Go to my ${APP_LABEL[role.type] ?? 'Tabeza app'}`,
            run: () => goTo(role.url, role.type),
          })),
        ].map((opt, i) => {
          const isNavigating = navigating === opt.key
          return (
            <button
              key={opt.key}
              onClick={opt.run}
              disabled={!!navigating}
              style={{
                display: 'block',
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderTop: i === 0 ? undefined : '1px solid var(--border-default)',
                borderRadius: '0.5rem',
                padding: '0.875rem 1rem',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                opacity: navigating && !isNavigating ? 0.45 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {isNavigating ? 'Loading…' : opt.label}
            </button>
          )
        })}
      </div>

      <button onClick={handleSignOut} style={{ marginTop: '2.5rem', background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
        Sign out
      </button>

      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem', marginTop: '1rem', lineHeight: 1.5 }}>
        {caption}
      </p>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--background-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--border-default)', borderTopColor: 'var(--amber)', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}