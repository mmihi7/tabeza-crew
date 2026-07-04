'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Phone, Lock, User, ArrowRight, ArrowLeft, Check } from 'lucide-react'

type AuthMethod = 'email' | 'phone' | 'google'
type Step = 'method' | 'credentials' | 'profile' | 'done'

interface FormData {
  method: AuthMethod
  email: string
  phone: string
  password: string
  confirmPassword: string
  fullName: string
  agreeToTerms: boolean
}

const STEP_LABELS: Record<Exclude<Step, 'method'>, string> = {
  credentials: 'Account',
  profile:     'Profile',
  done:        'Done',
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep]                 = useState<Step>('method')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [form, setForm]                 = useState<FormData>({
    method:          'email',
    email:           '',
    phone:           '',
    password:        '',
    confirmPassword: '',
    fullName:        '',
    agreeToTerms:    false,
  })

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  // ── Step progress for the progress bar ──────────────────────────────────
  const isGoogle    = form.method === 'google'
  const steps       = isGoogle
    ? (['profile', 'done'] as Step[])
    : (['credentials', 'profile', 'done'] as Step[])
  const stepIndex   = steps.indexOf(step)
  const showProgress = step !== 'method'

  // ── Validation ────────────────────────────────────────────────────────────
  function validateCredentials() {
    if (form.method === 'email') {
      if (!form.email)  return 'Enter your email address.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.'
    }
    if (form.method === 'phone') {
      if (!form.phone)  return 'Enter your phone number.'
    }
    if (!form.password || form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword)       return 'Passwords do not match.'
    return ''
  }

  function validateProfile() {
    if (!form.fullName.trim()) return 'Enter your full name.'
    if (!form.agreeToTerms)    return 'You must agree to the terms to continue.'
    return ''
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  function handleMethodSelect(m: AuthMethod) {
    update('method', m)
    if (m === 'google') {
      // Simulate Google OAuth, skip credentials step
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setStep('profile')
      }, 900)
    } else {
      setStep('credentials')
    }
  }

  function handleNext() {
    if (step === 'credentials') {
      const err = validateCredentials()
      if (err) { setError(err); return }
      setStep('profile')
    } else if (step === 'profile') {
      const err = validateProfile()
      if (err) { setError(err); return }
      setLoading(true)
      setTimeout(() => { setLoading(false); setStep('done') }, 1000)
    }
  }

  function handleBack() {
    setError('')
    if (step === 'credentials') setStep('method')
    if (step === 'profile')     setStep(isGoogle ? 'method' : 'credentials')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--background-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: '1rem',
            background: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: '0 8px 24px rgba(245,158,11,0.25)',
          }}
        >
          <img src="/icons/icon.svg" alt="Tabeza Crew" style={{ width: 32, height: 32 }} />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Join Tabeza Crew
        </h1>
        {step === 'method' && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            How do you want to create your account?
          </p>
        )}
      </div>

      {/* ── Progress bar (steps after method selection) ────────── */}
      {showProgress && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem', width: '100%', maxWidth: 400 }}>
          {steps.map((s, i) => {
            const done    = stepIndex > i
            const current = stepIndex === i
            const label   = STEP_LABELS[s as keyof typeof STEP_LABELS]
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <div
                    style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: done ? 'var(--success)' : current ? 'var(--amber)' : 'var(--background-tertiary)',
                      border: `2px solid ${done ? 'var(--success)' : current ? 'var(--amber)' : 'var(--border-default)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700,
                      color: done || current ? '#fff' : 'var(--text-tertiary)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {done ? <Check size={13} /> : i + 1}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: current ? 'var(--amber)' : 'var(--text-tertiary)', fontWeight: current ? 600 : 400 }}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      flex: 1, height: 2, marginBottom: '1rem',
                      background: done ? 'var(--success)' : 'var(--border-default)',
                      transition: 'background 0.3s',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* ════════════════════════════════════════════════════
            STEP: METHOD SELECTION
        ════════════════════════════════════════════════════ */}
        {step === 'method' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Google */}
            <button
              onClick={() => handleMethodSelect('google')}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1.25rem',
                background: 'var(--background-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '0.75rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Continue with Google
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Fastest — uses your Google account
                </div>
              </div>
              {loading ? (
                <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--amber)', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }} />
              ) : (
                <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }} />
              )}
            </button>

            {/* Email */}
            <button
              onClick={() => handleMethodSelect('email')}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1.25rem',
                background: 'var(--background-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '0.625rem', background: 'var(--amber-pale)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={18} style={{ color: 'var(--amber)' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Continue with Email
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Use your email address
                </div>
              </div>
              <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }} />
            </button>

            {/* Phone */}
            <button
              onClick={() => handleMethodSelect('phone')}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1.25rem',
                background: 'var(--background-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '0.625rem', background: 'var(--amber-pale)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={18} style={{ color: 'var(--amber)' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Continue with Phone
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Use your Kenyan phone number
                </div>
              </div>
              <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }} />
            </button>

          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP: CREDENTIALS  (email or phone)
        ════════════════════════════════════════════════════ */}
        {step === 'credentials' && (
          <div className="card">
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                {form.method === 'email' ? 'Set up your email login' : 'Set up your phone login'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {form.method === 'email'
                  ? 'You\'ll use this email to sign in.'
                  : 'You\'ll use this number to sign in and receive tips.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {form.method === 'email' && (
                <div>
                  <label className="input-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      type="email"
                      className="input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      style={{ paddingLeft: '2.25rem' }}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {form.method === 'phone' && (
                <div>
                  <label className="input-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      type="tel"
                      className="input"
                      placeholder="+254 7XX XXX XXX"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      style={{ paddingLeft: '2.25rem' }}
                      autoComplete="tel"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="input-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {showPassword ? <EyeOff size={15} style={{ color: 'var(--text-tertiary)' }} /> : <Eye size={15} style={{ color: 'var(--text-tertiary)' }} />}
                  </button>
                </div>
                {/* Strength hint */}
                {form.password.length > 0 && (
                  <div style={{ fontSize: '0.68rem', color: form.password.length >= 8 ? 'var(--success)' : 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                    {form.password.length >= 8 ? '✓ Strong enough' : `${8 - form.password.length} more characters needed`}
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="password"
                    className="input"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                    autoComplete="new-password"
                  />
                </div>
                {form.confirmPassword.length > 0 && (
                  <div style={{ fontSize: '0.68rem', color: form.password === form.confirmPassword ? 'var(--success)' : 'var(--error)', marginTop: '0.3rem' }}>
                    {form.password === form.confirmPassword ? '✓ Passwords match' : 'Passwords do not match'}
                  </div>
                )}
              </div>

              {error && <p style={{ fontSize: '0.75rem', color: 'var(--error)', margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.25rem' }}>
                <button className="btn-ghost" onClick={handleBack} style={{ flex: 1, gap: '0.375rem' }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button className="btn-primary" onClick={handleNext} style={{ flex: 2, gap: '0.375rem' }}>
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP: PROFILE
        ════════════════════════════════════════════════════ */}
        {step === 'profile' && (
          <div className="card">
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                Your public profile
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                This is what venues and customers see.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. James Mwangi"
                    value={form.fullName}
                    onChange={e => update('fullName', e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                    autoComplete="name"
                    autoFocus
                  />
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                  Use your real name — venues verify identity at check-in.
                </p>
              </div>

              {/* Terms */}
              <label
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.875rem',
                  borderRadius: '0.625rem',
                  background: form.agreeToTerms ? 'var(--amber-pale)' : 'var(--background-tertiary)',
                  border: `1px solid ${form.agreeToTerms ? 'rgba(245,158,11,0.25)' : 'var(--border-default)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    width: 20, height: 20, borderRadius: '0.375rem', flexShrink: 0,
                    marginTop: 1,
                    background: form.agreeToTerms ? 'var(--amber)' : 'var(--background-secondary)',
                    border: `2px solid ${form.agreeToTerms ? 'var(--amber)' : 'var(--border-default)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => update('agreeToTerms', !form.agreeToTerms)}
                >
                  {form.agreeToTerms && <Check size={12} style={{ color: '#1a1a2e' }} />}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <Link href="#" style={{ color: 'var(--amber)', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" style={{ color: 'var(--amber)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
                </span>
              </label>

              {error && <p style={{ fontSize: '0.75rem', color: 'var(--error)', margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.25rem' }}>
                <button className="btn-ghost" onClick={handleBack} style={{ flex: 1, gap: '0.375rem' }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button className="btn-primary" onClick={handleNext} disabled={loading} style={{ flex: 2, gap: '0.375rem' }}>
                  {loading ? 'Creating…' : <>Create Account <ArrowRight size={14} /></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP: DONE
        ════════════════════════════════════════════════════ */}
        {step === 'done' && (
          <div className="card" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(16,185,129,0.12)',
                border: '2px solid var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Check size={36} style={{ color: 'var(--success)' }} />
            </div>

            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              Welcome, {form.fullName.split(' ')[0] || 'to Tabeza Crew'}!
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Your account is ready. Add the app to your home screen so you never miss a shift or hire offer.
            </p>

            {/* Install nudge */}
            <div className="card-amber" style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.625rem', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src="/icons/icon.svg" alt="" style={{ width: 24, height: 24 }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tabeza Crew</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>crew.tabeza.co.ke</div>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Tap <strong>Share</strong> (iOS) or <strong>⋮ menu</strong> (Android) → &ldquo;Add to Home Screen&rdquo;
              </p>
            </div>

            <button className="btn-primary" style={{ width: '100%', marginBottom: '0.625rem' }} onClick={() => router.push('/waiter')}>
              Go to Dashboard
            </button>
            <button className="btn-ghost" style={{ width: '100%' }} onClick={() => router.push('/waiter')}>
              Skip for now
            </button>
          </div>
        )}

        {step === 'method' && (
          <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--amber)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        )}
      </div>

      <p style={{ marginTop: '2.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Tabeza · crew.tabeza.co.ke
      </p>

      {/* Spin animation for Google loading */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
