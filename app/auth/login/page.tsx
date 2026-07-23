'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/Logo'
import { Eye, EyeOff, Mail, Phone, Lock, ArrowRight } from 'lucide-react'
import { supabase, getAppUrl } from '@/lib/supabase'

type AuthMethod = 'email' | 'phone' | 'google'

// useSearchParams must be inside a Suspense boundary in Next.js 14 App Router.
// We split into an inner component and wrap the export in Suspense.

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginInner />
    </Suspense>
  )
}

function LoginSkeleton() {
  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--background-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid var(--border-default)',
        borderTopColor: 'var(--amber)',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}

function LoginInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [method, setMethod]               = useState<AuthMethod>('email')
  const [email, setEmail]                 = useState('')
  const [phone, setPhone]                 = useState('')
  const [password, setPassword]           = useState('')
  const [showPassword, setShowPassword]   = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')

  // Show any error passed back from the OAuth callback
  useEffect(() => {
    const callbackError = searchParams.get('error')
    if (callbackError === 'oauth_failed')      setError('Google sign-in failed. Please try again.')
    if (callbackError === 'link_expired')      setError('This link has expired. Request a new one.')
    if (callbackError === 'unknown_callback')  setError('Something went wrong. Please try again.')
  }, [searchParams])

  const nextPath = searchParams.get('next') ?? '/waiter'

  // ── Email / password sign in ────────────────────────────────────────────
  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email)    return setError('Enter your email address.')
    if (!password) return setError('Enter your password.')

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (authError) {
      if (authError.message.includes('Invalid login')) {
        setError('Incorrect email or password.')
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Please confirm your email first. Check your inbox.')
      } else {
        setError(authError.message)
      }
      return
    }

    // ── Multi-role check ───────────────────────────────────────────
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const rolesRes = await fetch('/api/auth/roles', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (rolesRes.ok) {
          const { roles } = await rolesRes.json()
          if (roles.length > 1) {
            router.push('/select-role')
            return
          }
        }
      }
    } catch {
      // Non-fatal — fall through to default destination
    }

    // Set flag that user has previously logged in
    localStorage.setItem('crew_previous_login', 'true')
    router.push(nextPath)
    router.refresh()
  }

  // ── Phone / password sign in ─────────────────────────────────────────────
  // Note: Supabase phone auth requires a verified phone number + SMS OTP flow.
  // For now we sign in with email using the phone number as a lookup — this is
  // a placeholder until SMS OTP is enabled on the Supabase project.
  async function handlePhoneSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!phone)    return setError('Enter your phone number.')
    if (!password) return setError('Enter your password.')

    setLoading(true)
    // Phone sign-in via Supabase requires SMS OTP — show guidance
    setLoading(false)
    setError('Phone sign-in coming soon. Use email or Google for now.')
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  async function handleGoogle() {
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (authError) {
      setLoading(false)
      setError('Could not connect to Google. Try again.')
    }
    // On success, browser is redirected to Google — loading stays true
  }

  function handleSubmit(e: React.FormEvent) {
    if (method === 'email') return handleEmailSignIn(e)
    if (method === 'phone') return handlePhoneSignIn(e)
    e.preventDefault()
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--background-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ margin: '0 auto 0.875rem', display: 'flex', justifyContent: 'center' }}>
          <Logo size="xl" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Tabeza Crew
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Sign in to your waiter account
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* ── Google ────────────────────────────────────────────── */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'var(--background-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: '0.625rem',
            fontSize: '0.875rem', fontWeight: 600,
            color: 'var(--text-primary)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            marginBottom: '1rem',
            transition: 'background 0.15s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>or sign in with</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
        </div>

        {/* ── Method toggle ─────────────────────────────────────── */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'var(--background-tertiary)',
            borderRadius: '0.625rem',
            padding: '0.25rem',
            marginBottom: '1.25rem',
          }}
        >
          {(['email', 'phone'] as AuthMethod[]).map(m => (
            <button
              key={m}
              onClick={() => { setMethod(m); setError('') }}
              style={{
                padding: '0.5rem',
                borderRadius: '0.4rem',
                border: 'none',
                fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: method === m ? 'var(--background-secondary)' : 'transparent',
                color: method === m ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: method === m ? 'var(--shadow-sm)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              }}
            >
              {m === 'email' ? <><Mail size={13} /> Email</> : <><Phone size={13} /> Phone</>}
            </button>
          ))}
        </div>

        {/* ── Form ──────────────────────────────────────────────── */}
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {method === 'email' && (
              <div>
                <label className="input-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    style={{ paddingLeft: '2.25rem' }}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {method === 'phone' && (
              <div>
                <label className="input-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="tel"
                    className="input"
                    placeholder="+254 7XX XXX XXX"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError('') }}
                    style={{ paddingLeft: '2.25rem' }}
                    autoComplete="tel"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="input-label" style={{ margin: 0 }}>Password</label>
                <Link href="#" style={{ fontSize: '0.72rem', color: 'var(--amber)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={15} style={{ color: 'var(--text-tertiary)' }} /> : <Eye size={15} style={{ color: 'var(--text-tertiary)' }} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ fontSize: '0.8rem', color: 'var(--error)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', padding: '0.625rem 0.75rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', gap: '0.375rem', marginTop: '0.125rem' }}
              disabled={loading}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LoadingSpinner /> Signing in…
                  </span>
                : <> Sign In <ArrowRight size={15} /></>
              }
            </button>
          </form>
        </div>

        <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          New to Tabeza Crew?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--amber)', fontWeight: 600, textDecoration: 'none' }}>
            Create account
          </Link>
        </p>
      </div>

      <p style={{ marginTop: '2.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Tabeza · crew.tabeza.co.ke
      </p>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <span
      style={{
        width: 14, height: 14, borderRadius: '50%',
        border: '2px solid rgba(26,26,46,0.3)',
        borderTopColor: '#1a1a2e',
        display: 'inline-block',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  )
}