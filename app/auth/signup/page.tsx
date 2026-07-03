'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, User, Phone, Lock, ArrowRight, ArrowLeft, Check } from 'lucide-react'

type Step = 1 | 2 | 3

interface FormData {
  fullName: string
  phone: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

const STEPS = [
  { number: 1, label: 'Account' },
  { number: 2, label: 'Profile' },
  { number: 3, label: 'Done' },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

  function update(field: keyof FormData, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function validateStep1() {
    if (!form.phone) return 'Enter your phone number.'
    if (!form.password || form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return ''
  }

  function validateStep2() {
    if (!form.fullName.trim()) return 'Enter your full name.'
    if (!form.agreeToTerms) return 'Please agree to the terms to continue.'
    return ''
  }

  function handleNext() {
    const err = step === 1 ? validateStep1() : validateStep2()
    if (err) { setError(err); return }
    if (step === 2) {
      setLoading(true)
      setTimeout(() => { setLoading(false); setStep(3) }, 1000)
    } else {
      setStep((step + 1) as Step)
    }
  }

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
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: '1rem',
            background: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem', fontSize: '1.5rem',
          }}
        >
          🍽️
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Join Tabeza Crew
        </h1>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '1.75rem', width: '100%', maxWidth: 400 }}>
        {STEPS.map((s, i) => {
          const done    = step > s.number
          const current = step === s.number
          return (
            <div key={s.number} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: done ? 'var(--success)' : current ? 'var(--amber)' : 'var(--background-tertiary)',
                    border: `2px solid ${done ? 'var(--success)' : current ? 'var(--amber)' : 'var(--border-default)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700,
                    color: done || current ? '#fff' : 'var(--text-tertiary)',
                    transition: 'all 0.2s',
                  }}
                >
                  {done ? <Check size={14} /> : s.number}
                </div>
                <span style={{ fontSize: '0.65rem', color: current ? 'var(--amber)' : 'var(--text-tertiary)', fontWeight: current ? 600 : 400 }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1, height: 2, marginBottom: '1.1rem',
                    background: step > s.number ? 'var(--success)' : 'var(--border-default)',
                    transition: 'background 0.3s',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Card */}
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>

        {/* ── Step 1: Credentials ─────────────────────────────────── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Create your account
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Your phone number is your login.
              </p>
            </div>

            <div>
              <label className="input-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="tel"
                  className="input"
                  placeholder="+254 7XX XXX XXX"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} style={{ color: 'var(--text-tertiary)' }} /> : <Eye size={16} style={{ color: 'var(--text-tertiary)' }} />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="password"
                  className="input"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            {error && <p style={{ fontSize: '0.75rem', color: 'var(--error)', margin: 0 }}>{error}</p>}

            <button className="btn-primary" style={{ width: '100%', gap: '0.375rem' }} onClick={handleNext}>
              Continue <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ── Step 2: Profile ─────────────────────────────────────── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Tell us about yourself
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                This appears on your public profile.
              </p>
            </div>

            <div>
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. James Mwangi"
                  value={form.fullName}
                  onChange={e => update('fullName', e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Terms */}
            <label
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                cursor: 'pointer', padding: '0.75rem',
                borderRadius: '0.5rem',
                background: form.agreeToTerms ? 'var(--amber-pale)' : 'var(--background-tertiary)',
                border: `1px solid ${form.agreeToTerms ? 'rgba(245,158,11,0.25)' : 'var(--border-default)'}`,
                transition: 'all 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={form.agreeToTerms}
                onChange={e => update('agreeToTerms', e.target.checked)}
                style={{ marginTop: 2, accentColor: 'var(--amber)', flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                I agree to the{' '}
                <Link href="#" style={{ color: 'var(--amber)', textDecoration: 'none', fontWeight: 600 }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" style={{ color: 'var(--amber)', textDecoration: 'none', fontWeight: 600 }}>
                  Privacy Policy
                </Link>
              </span>
            </label>

            {error && <p style={{ fontSize: '0.75rem', color: 'var(--error)', margin: 0 }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button
                className="btn-ghost"
                style={{ flex: 1, gap: '0.375rem' }}
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, gap: '0.375rem' }}
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? 'Creating…' : <>Create Account <ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Success + install prompt ────────────────────── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(16,185,129,0.12)',
                border: '2px solid var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Check size={36} style={{ color: 'var(--success)' }} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                Welcome to Tabeza Crew!
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your account is ready. Add the app to your home screen for the best experience.
              </p>
            </div>

            {/* Install prompt */}
            <div
              style={{
                width: '100%',
                background: 'var(--amber-pale)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '0.75rem',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: '0.75rem',
                    background: 'var(--amber)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', flexShrink: 0,
                  }}
                >
                  🍽️
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Tabeza Crew
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    crew.tabeza.co.ke
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5, textAlign: 'left' }}>
                Tap the <strong>Share</strong> button (iOS) or <strong>menu ⋮</strong> (Android),
                then &ldquo;Add to Home Screen&rdquo; for one-tap access to shifts and job offers.
              </p>

              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={() => router.push('/waiter')}
              >
                Got it — Go to Dashboard
              </button>
            </div>

            <button
              className="btn-ghost"
              style={{ width: '100%' }}
              onClick={() => router.push('/waiter')}
            >
              Skip for now
            </button>
          </div>
        )}
      </div>

      {/* Sign in link */}
      {step < 3 && (
        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--amber)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      )}
    </div>
  )
}
