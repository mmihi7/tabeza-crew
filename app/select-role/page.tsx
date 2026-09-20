'use client'

// /select-role — shown when a user has access to more than one Tabeza platform.

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

export default function SelectRolePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SelectRoleInner />
    </Suspense>
  )
}

function SelectRoleInner() {
  const router = useRouter()
  const [roles, setRoles]           = useState<UserRole[]>([])
  const [loading, setLoading]       = useState(true)
  const [navigating, setNavigating] = useState<string | null>(null)
  const [error, setError]           = useState('')

  // True when the destination points at this same app (same origin or relative path).
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
        setError('Could not load your roles. Please try again.')
        setLoading(false)
        return
      }

      const data = await res.json()

      if (data.roles.length <= 1) {
        const dest = data.roles[0]?.url ?? '/waiter'
        if (isSelfApp(dest)) {
          router.replace(dest.startsWith('http') ? '/waiter' : dest)
        } else {
          window.location.href = dest
        }
        return
      }

      setRoles(data.roles)
      setLoading(false)
    }

    load()
  }, [router])

  function handlePick(role: UserRole) {
    setNavigating(role.type)
    if (isSelfApp(role.url)) {
      router.push(role.url.startsWith('http') ? '/waiter' : role.url)
    } else {
      window.location.href = role.url
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--background-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <Logo size="xl" />

      <h1 style={{ textAlign: 'center', margin: '2.5rem 0 2.25rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 400 }}>
        Where to?
      </h1>

      {error && (
        <div style={{ color: 'var(--error)', fontSize: '0.8rem', margin: '-1rem 0 1.75rem', maxWidth: 380, textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', width: '100%', maxWidth: 380 }}>
        {roles.map((role) => {
          const isNavigating = navigating === role.type
          const isAdmin = role.type === 'tabeza'
          const border = isAdmin
            ? 'rgba(255,165,0,0.35)'
            : 'var(--border-default)'

          return (
            <button
              key={role.type}
              onClick={() => handlePick(role)}
              disabled={!!navigating}
              style={{
                background: isAdmin ? 'rgba(255,165,0,0.04)' : 'transparent',
                border: `1px solid ${border}`,
                borderRadius: '0.9rem',
                padding: '0.875rem 1.125rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: 400,
                fontFamily: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                opacity: navigating && !isNavigating ? 0.5 : 1,
                transition: 'opacity 0.15s, border-color 0.15s',
              }}
            >
              {isNavigating ? 'Loading…' : isAdmin ? `${role.label} — Platform` : role.label}
            </button>
          )
        })}
      </div>

      <button onClick={handleSignOut} style={{ marginTop: '3.5rem', background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
        Sign out
      </button>
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