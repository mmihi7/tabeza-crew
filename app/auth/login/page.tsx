'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Phone, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!phone || !password) {
      setError('Please enter your phone number and password.')
      return
    }
    setLoading(true)
    // UI demo — replace with Supabase auth
    setTimeout(() => {
      setLoading(false)
      router.push('/waiter')
    }, 1200)
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
      {/* Logo / wordmark */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: '1rem',
            background: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.875rem',
            fontSize: '1.75rem',
          }}
        >
          🍽️
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Tabeza Crew
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Sign in to your waiter account
        </p>
      </div>

      {/* Card */}
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Phone */}
          <div>
            <label className="input-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone
                size={16}
                style={{
                  position: 'absolute', left: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }}
              />
              <input
                type="tel"
                className="input"
                placeholder="+254 7XX XXX XXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute', left: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                {showPassword
                  ? <EyeOff size={16} style={{ color: 'var(--text-tertiary)' }} />
                  : <Eye    size={16} style={{ color: 'var(--text-tertiary)' }} />
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontSize: '0.75rem', color: 'var(--error)', margin: 0 }}>{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.25rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          {/* Forgot password */}
          <div style={{ textAlign: 'center' }}>
            <Link
              href="#"
              style={{ fontSize: '0.8rem', color: 'var(--amber)', textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>

      {/* Sign up link */}
      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        New to Tabeza Crew?{' '}
        <Link
          href="/auth/signup"
          style={{ color: 'var(--amber)', fontWeight: 600, textDecoration: 'none' }}
        >
          Create account
        </Link>
      </p>

      {/* Footer */}
      <p style={{ marginTop: '2rem', fontSize: '0.7rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Tabeza · crew.tabeza.co.ke
      </p>
    </div>
  )
}
