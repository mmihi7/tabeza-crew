'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/**
 * /auth/callback
 *
 * Handles Supabase auth redirects:
 *  1. Google OAuth — PKCE ?code= → exchangeCodeForSession
 *  2. Hash fragment tokens (#access_token=...) — email confirmation links
 *  3. OTP token_hash — email confirmation / password recovery links
 *
 * After the session is established:
 *  - Teams up with /api/staff/create so Google signups get a crew_members row
 *  - Routes by multi-role (role picker) or the `next` param (default /waiter)
 */

function CallbackSpinner() {
  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--background-primary)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '0.75rem',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid var(--border-default)',
        borderTopColor: 'var(--amber)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Signing you in…</p>
    </div>
  )
}

function AuthCallbackInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function ensureSession(accessToken?: string) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.replace('/auth/login?error=session')
        return false
      }

      const token = accessToken ?? session.access_token

      // Create crew_members row for Google signups (idempotent)
      try {
        const user = session.user
        await fetch('/api/staff/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
            phone_number:  user.phone || user.email || '',
            location:      user.user_metadata?.location || '',
            latitude:      user.user_metadata?.latitude ?? null,
            longitude:     user.user_metadata?.longitude ?? null,
          }),
        })
      } catch (err) {
        // Non-fatal — don't block signup on this error
        console.error('[auth/callback] Failed to create crew_members record:', err)
      }

      // Multi-role routing — if the user belongs to more than one platform,
      // send them to the role picker.
      try {
        const rolesRes = await fetch('/api/auth/roles', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (rolesRes.ok) {
          const { roles } = await rolesRes.json()
          if (roles.length > 1) {
            router.replace('/select-role')
            return true
          }
        }
      } catch {
        // Non-fatal — fall through to default destination
      }

      return true
    }

    async function handleCallback() {
      // ── 1. Google OAuth PKCE flow ───────────────────────────────────
      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('[auth/callback] OAuth exchange error:', error.message)
          router.replace('/auth/login?error=oauth_failed')
          return
        }
        const ok = await ensureSession()
        if (ok) router.replace(searchParams.get('next') ?? '/waiter')
        return
      }

      // ── 2. OTP token flow (email confirmation / recovery) ─────────────
      const token_hash = searchParams.get('token_hash')
      const type       = searchParams.get('type')
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as 'signup' | 'recovery',
        })
        if (!error) {
          const destination = type === 'recovery' ? '/auth/reset-password' : (searchParams.get('next') ?? '/waiter')
          router.replace(destination)
        } else {
          console.error('[auth/callback] OTP verify error:', error.message)
          router.replace('/auth/login?error=link_expired')
        }
        return
      }

      // ── 3. Hash fragment tokens (legacy email links) ─────────────────
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken,
        })
        if (!error) {
          const ok = await ensureSession()
          if (ok) router.replace(searchParams.get('next') ?? '/waiter')
        } else {
          console.error('[auth/callback] setSession error:', error.message)
          router.replace('/auth/login?error=callback_failed')
        }
        return
      }

      router.replace('/auth/login?error=unknown_callback')
    }

    handleCallback()
  }, [router, searchParams])

  return <CallbackSpinner />
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackSpinner />}>
      <AuthCallbackInner />
    </Suspense>
  )
}