'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Phone, Lock, ArrowRight } from 'lucide-react'

type AuthMethod = 'email' | 'phone' | 'google'

export default function LoginPage() {
  const router = useRouter()
  const [method, setMethod]           = useState<AuthMethod>('email')
  const [email, setEmail]             = useState('')
  const [phone, setPhone]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (method === 'email') {
      if (!email) return setError('Enter your email address.')
      if (!password) return setError('Enter your password.')
    }
    if (method === 'phone') {
      if (!phone) return setError('Enter your phone number.')
      if (!password) return setError('Enter your password.')
    }

    setLoading(true)
    // TODO: replace with Supabase auth
    setTimeout(() => {
      setLoading(false)
      router.push('/waiter')
    }, 1200)
  }

  function handleGoogle() {
    setLoading(true)
    // TODO: replace with Supabase Google OAuth
    setTimeout(() => {
      setLoading(false)
      router.push('/waiter')
    }, 1000)
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
        <div
          style={{
            width: 64, height: 64, borderRadius: '1.125rem',
            background: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.875rem',
            boxShadow: '0 8px 24px rgba(245,158,11,0.30)',
          }}
        >
          <img src="/icons/icon.svg" alt="Tabeza Crew" style={{ width: 40, height: 40 }} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Tabeza Crew
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Sign in to your waiter account
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* ── Google button (always visible at top) ─────────── */}
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
          {/* Google G icon */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* ── Divider ────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>or sign in with</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
        </div>

        {/* ── Method tab selector ────────────────────────────── */}
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
              {m === 'email'
                ? <><Mail size={13} /> Email</>
                : <><Phone size={13} /> Phone</>
              }
            </button>
          ))}
        </div>

        {/* ── Form card ──────────────────────────────────────── */}
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Email field */}
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

            {/* Phone field */}
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

            {/* Password field (email + phone) */}
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
                  {showPassword
                    ? <EyeOff size={15} style={{ color: 'var(--text-tertiary)' }} />
                    : <Eye    size={15} style={{ color: 'var(--text-tertiary)' }} />
                  }
                </button>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: '0.75rem', color: 'var(--error)', margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', gap: '0.375rem', marginTop: '0.125rem' }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : <> Sign In <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        {/* ── Sign up link ───────────────────────────────────── */}
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
