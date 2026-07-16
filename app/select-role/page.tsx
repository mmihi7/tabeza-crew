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

const ROLE_META: Record<UserRole['type'], { icon: string; accent: string }> = {
  tabeza:   { icon: '🏢', accent: '#FF4F00' },
  staff:    { icon: '🍸', accent: '#FF4F00' },
  crew:     { icon: '🧑‍🍳', accent: 'var(--amber)' },
  customer: { icon: '🪑', accent: '#10b981' },
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
        if (dest.startsWith('/') || dest.includes('crew.tabeza.co.ke') || dest.includes('localhost:3004')) {
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
    if (role.url.includes('crew.tabeza.co.ke') || role.url.includes('localhost:3004') || role.url.startsWith('/')) {
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
    <div style={{
      minHeight: '100dvh',
      background: 'var(--background-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .role-card {
          animation: fadeUp 0.3s ease both;
          cursor: pointer;
          transition: box-shadow 0.15s, border-color 0.15s, transform 0.15s;
        }
        .role-card:hover  { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        .role-card:active { transform: translateY(0); }
      `}</style>

      {/* Logo */}
      <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <Logo size="xl" />
        </div>
        <span style={{
          fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
        }}>
          Tabeza
        </span>
      </div>

      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem', maxWidth: 340 }}>
        <h1 style={{
          fontSize: '1.375rem', fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: '0.375rem',
        }}>
          Where to?
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {roles.some(r => r.type === 'tabeza')
            ? 'You have platform and app access. Choose where to go.'
            : 'You have access to multiple Tabeza platforms. Pick one to continue.'
          }
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '0.625rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.8rem',
          color: 'var(--error)',
          width: '100%',
          maxWidth: 380,
        }}>
          {error}
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: 380 }}>
        {roles.map((role, i) => {
          const meta = ROLE_META[role.type]
          const isNavigating = navigating === role.type
          const isAdmin = role.type === 'tabeza'

          if (isAdmin) {
            return (
              <button
                key={role.type}
                className="role-card"
                onClick={() => handlePick(role)}
                disabled={!!navigating}
                style={{
                  animationDelay: `${i * 0.065}s`,
                  background: 'linear-gradient(135deg, rgba(255,79,0,0.12) 0%, rgba(255,79,0,0.04) 100%)',
                  border: `1.5px solid ${isNavigating ? '#FF4F00' : 'rgba(255,79,0,0.35)'}`,
                  borderRadius: '0.875rem',
                  padding: '1.125rem 1.125rem',
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  textAlign: 'left', width: '100%',
                  opacity: navigating && !isNavigating ? 0.4 : 1,
                  transition: 'opacity 0.15s',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 70, height: 70,
                  background: 'radial-gradient(circle, rgba(255,79,0,0.15) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  width: 50, height: 50, borderRadius: '0.625rem',
                  background: 'rgba(255,79,0,0.15)',
                  border: '1px solid rgba(255,79,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.375rem', flexShrink: 0,
                }}>
                  {isNavigating
                    ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,79,0,0.3)', borderTopColor: '#FF4F00', animation: 'spin 0.7s linear infinite' }} />
                    : '⚡'
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{role.label}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FF4F00', background: 'rgba(255,79,0,0.1)', border: '1px solid rgba(255,79,0,0.2)', borderRadius: '0.25rem', padding: '0.1rem 0.4rem' }}>
                      Platform
                    </span>
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role.description}</div>
                </div>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ color: '#FF4F00', flexShrink: 0 }}>
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )
          }

          return (
            <button
              key={role.type}
              className="role-card"
              onClick={() => handlePick(role)}
              disabled={!!navigating}
              style={{
                animationDelay: `${i * 0.065}s`,
                background: 'var(--background-secondary)',
                border: `1.5px solid ${isNavigating ? meta.accent : 'var(--border-default)'}`,
                borderRadius: '0.875rem',
                padding: '1rem 1.125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                textAlign: 'left',
                width: '100%',
                opacity: navigating && !isNavigating ? 0.4 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <div style={{
                width: 46, height: 46,
                borderRadius: '0.625rem',
                background: `${meta.accent}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}>
                {isNavigating
                  ? <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: `2px solid ${meta.accent}40`,
                      borderTopColor: meta.accent,
                      animation: 'spin 0.7s linear infinite',
                    }} />
                  : meta.icon
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{role.label}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role.description}</div>
              </div>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ color: meta.accent, flexShrink: 0 }}>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleSignOut}
        style={{
          marginTop: '2rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-tertiary)',
          fontSize: '0.775rem',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        Sign out
      </button>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--background-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
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
