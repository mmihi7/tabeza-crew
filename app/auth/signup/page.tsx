'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Phone, Lock, User, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { createBrowserClient, getAppUrl } from '@/lib/supabase'

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
  profile: 'Profile',
  done: 'Done',
}

function LoadingSpinner() {
  return (
    <span style={{
      width: 14, height: 14, borderRadius: '50%',
      border: '2px solid rgba(26,26,46,0.3)',
      borderTopColor: '#1a1a2e',
      display: 'inline-block',
      animation: 'spin 0.6s linear infinite',
    }} />
  )
}

export default function SignupPage() {
  const router   = useRouter()
  const supabase = createBrowserClient()

  const [step, setStep]                 = useState<Step>('method')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [form, setForm]                 = useState<FormData>({
    method: 'email', email: '', phone: '',
    password: '', confirmPassword: '',
    fullName: '', agreeToTerms: false,
  })

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const isGoogle     = form.method === 'google'
  const steps        = isGoogle
    ? (['profile', 'done'] as Step[])
    : (['credentials', 'profile', 'done'] as Step[])
  const stepIndex    = steps.indexOf(step)
  const showProgress = step !== 'method'

  function validateCredentials() {
    if (form.method === 'email') {
      if (!form.email) return 'Enter your email address.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.'
    }
    if (form.method === 'phone') {
      if (!form.phone) return 'Enter your phone number.'
    }
    if (!form.password || form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return ''
  }

  function validateProfile() {
    if (!form.fullName.trim()) return 'Enter your full name.'
    if (!form.agreeToTerms)    return 'You must agree to the terms to continue.'
    return ''
  }

  function handleBack() {
    setError('')
    if (step === 'credentials') setStep('method')
    if (step === 'profile')     setStep(isGoogle ? 'method' : 'credentials')
  }

  // ── Google OAuth ────────────────────────────────────────────────────────
  async function handleGoogleSignup() {
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getAppUrl()}/auth/callback?next=/waiter`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (authError) { setLoading(false); setError('Could not connect to Google. Try again.') }
  }

  // ── Method selection ────────────────────────────────────────────────────
  function handleMethodSelect(m: AuthMethod) {
    update('method', m)
    if (m === 'google') { handleGoogleSignup(); return }
    setStep('credentials')
  }

  // ── Create account (email) ──────────────────────────────────────────────
  async function createEmailAccount() {
    setLoading(true)
    const identifier = form.method === 'email' ? form.email : form.phone + '@crew.tabeza.co.ke'

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: identifier,
      password: form.password,
      options: {
        emailRedirectTo: `${getAppUrl()}/auth/callback?next=/waiter`,
        data: { display_name: form.fullName },
      },
    })

    if (signUpError) {
      setLoading(false)
      if (signUpError.message.includes('already registered')) {
        setError('An account with this email already exists. Sign in instead.')
      } else {
        setError(signUpError.message)
      }
      return
    }

    // Create staff_members row (best-effort — will also be created server-side)
    if (data.user) {
      await supabase.from('staff_members').insert({
        user_id:         data.user.id,
        display_name:    form.fullName,
        phone_number:    form.phone || form.email,
        onboarding_status: 'pending',
      }).select().single()
      // Silently ignore errors — the row may already exist or be created by trigger
    }

    setLoading(false)
    setStep('done')
  }

  // ── Continue button ─────────────────────────────────────────────────────
  async function handleNext() {
    if (step === 'credentials') {
      const err = validateCredentials()
      if (err) { setError(err); return }
      setStep('profile')
    } else if (step === 'profile') {
      const err = validateProfile()
      if (err) { setError(err); return }
      await createEmailAccount()
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--background-primary)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '1rem', background: 'var(--amber)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 0.75rem', boxShadow: '0 8px 24px rgba(245,158,11,0.25)',
        }}>
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

      {/* Progress bar */}
      {showProgress && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem', width: '100%', maxWidth: 400 }}>
          {steps.map((s, i) => {
            const done = stepIndex > i; const current = stepIndex === i
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', fontSize: '0.75rem', fontWeight: 700,
                    background: done ? 'var(--success)' : current ? 'var(--amber)' : 'var(--background-tertiary)',
                    border: `2px solid ${done ? 'var(--success)' : current ? 'var(--amber)' : 'var(--border-default)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: done || current ? '#fff' : 'var(--text-tertiary)', transition: 'all 0.2s',
                  }}>
                    {done ? <Check size={13} /> : i + 1}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: current ? 'var(--amber)' : 'var(--text-tertiary)', fontWeight: current ? 600 : 400 }}>
                    {STEP_LABELS[s as keyof typeof STEP_LABELS]}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, marginBottom: '1rem', background: done ? 'var(--success)' : 'var(--border-default)', transition: 'background 0.3s' }} />
                )}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* ── METHOD SELECTION ─────────────────────────────────── */}
        {step === 'method' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Google */}
            <button onClick={() => handleMethodSelect('google')} disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.25rem', background: 'var(--background-secondary)', border: '1px solid var(--border-default)', borderRadius: '0.75rem', cursor: 'pointer', textAlign: 'left' }}>
              <svg width="22" height="22" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Continue with Google</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Fastest — uses your Google account</div>
              </div>
              {loading ? <LoadingSpinner /> : <ArrowRight size={16} style={{ color: 'var(--text-tertiary)' }} />}
            </button>

            {/* Email */}
            {[
              { m: 'email' as AuthMethod, label: 'Continue with Email', sub: 'Use your email address', icon: <Mail size={18} style={{ color: 'var(--amber)' }} /> },
              { m: 'phone' as AuthMethod, label: 'Continue with Phone', sub: 'Use your Kenyan phone number', icon: <Phone size={18} style={{ color: 'var(--amber)' }} /> },
            ].map(({ m, label, sub, icon }) => (
              <button key={m} onClick={() => handleMethodSelect(m)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.25rem', background: 'var(--background-secondary)', border: '1px solid var(--border-default)', borderRadius: '0.75rem', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.625rem', background: 'var(--amber-pale)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{sub}</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-tertiary)' }} />
              </button>
            ))}
          </div>
        )}

        {/* ── CREDENTIALS ──────────────────────────────────────── */}
        {step === 'credentials' && (
          <div className="card">
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                {form.method === 'email' ? 'Set up your email login' : 'Set up your phone login'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {form.method === 'email' ? "You'll use this email to sign in." : "You'll use this number to sign in and receive tips."}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {form.method === 'email' && (
                <div>
                  <label className="input-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input type="email" className="input" placeholder="you@example.com" value={form.email}
                      onChange={e => update('email', e.target.value)} style={{ paddingLeft: '2.25rem' }}
                      autoComplete="email" autoFocus />
                  </div>
                </div>
              )}
              {form.method === 'phone' && (
                <div>
                  <label className="input-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input type="tel" className="input" placeholder="+254 7XX XXX XXX" value={form.phone}
                      onChange={e => update('phone', e.target.value)} style={{ paddingLeft: '2.25rem' }}
                      autoComplete="tel" autoFocus />
                  </div>
                </div>
              )}
              <div>
                <label className="input-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input type={showPassword ? 'text' : 'password'} className="input" placeholder="Min. 8 characters"
                    value={form.password} onChange={e => update('password', e.target.value)}
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {showPassword ? <EyeOff size={15} style={{ color: 'var(--text-tertiary)' }} /> : <Eye size={15} style={{ color: 'var(--text-tertiary)' }} />}
                  </button>
                </div>
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
                  <input type="password" className="input" placeholder="Repeat password"
                    value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                    style={{ paddingLeft: '2.25rem' }} autoComplete="new-password" />
                </div>
                {form.confirmPassword.length > 0 && (
                  <div style={{ fontSize: '0.68rem', color: form.password === form.confirmPassword ? 'var(--success)' : 'var(--error)', marginTop: '0.3rem' }}>
                    {form.password === form.confirmPassword ? '✓ Passwords match' : 'Passwords do not match'}
                  </div>
                )}
              </div>
              {error && <div style={{ fontSize: '0.8rem', color: 'var(--error)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', padding: '0.625rem 0.75rem' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.25rem' }}>
                <button className="btn-ghost" onClick={handleBack} style={{ flex: 1, gap: '0.375rem' }}><ArrowLeft size={14} /> Back</button>
                <button className="btn-primary" onClick={handleNext} style={{ flex: 2, gap: '0.375rem' }}>Continue <ArrowRight size={14} /></button>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE ──────────────────────────────────────────── */}
        {step === 'profile' && (
          <div className="card">
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Your public profile</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>This is what venues and customers see.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input type="text" className="input" placeholder="e.g. James Mwangi" value={form.fullName}
                    onChange={e => update('fullName', e.target.value)} style={{ paddingLeft: '2.25rem' }}
                    autoComplete="name" autoFocus />
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                  Use your real name — venues verify identity at check-in.
                </p>
              </div>
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem',
                borderRadius: '0.625rem', cursor: 'pointer', transition: 'all 0.15s',
                background: form.agreeToTerms ? 'var(--amber-pale)' : 'var(--background-tertiary)',
                border: `1px solid ${form.agreeToTerms ? 'rgba(245,158,11,0.25)' : 'var(--border-default)'}`,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '0.375rem', flexShrink: 0, marginTop: 1,
                  background: form.agreeToTerms ? 'var(--amber)' : 'var(--background-secondary)',
                  border: `2px solid ${form.agreeToTerms ? 'var(--amber)' : 'var(--border-default)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                }} onClick={() => update('agreeToTerms', !form.agreeToTerms)}>
                  {form.agreeToTerms && <Check size={12} style={{ color: '#1a1a2e' }} />}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <Link href="#" style={{ color: 'var(--amber)', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" style={{ color: 'var(--amber)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
                </span>
              </label>
              {error && <div style={{ fontSize: '0.8rem', color: 'var(--error)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', padding: '0.625rem 0.75rem' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.25rem' }}>
                <button className="btn-ghost" onClick={handleBack} style={{ flex: 1, gap: '0.375rem' }}><ArrowLeft size={14} /> Back</button>
                <button className="btn-primary" onClick={handleNext} disabled={loading} style={{ flex: 2, gap: '0.375rem' }}>
                  {loading ? <><LoadingSpinner /> Creating…</> : <>Create Account <ArrowRight size={14} /></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DONE ─────────────────────────────────────────────── */}
        {step === 'done' && (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)', border: '2px solid var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
            }}>
              <Check size={36} style={{ color: 'var(--success)' }} />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              Welcome, {form.fullName.split(' ')[0] || 'to Tabeza Crew'}!
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {form.method === 'email'
                ? 'Check your inbox — we sent a confirmation link. Click it to activate your account.'
                : 'Your account is ready. Add the app to your home screen for the best experience.'}
            </p>
            {form.method === 'email' && (
              <div style={{
                padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.625rem',
                fontSize: '0.8rem', color: '#3b82f6', marginBottom: '1.25rem', textAlign: 'left',
              }}>
                📧 Sent to <strong>{form.email}</strong><br />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Check spam if you don&rsquo;t see it. Link expires in 24 hours.
                </span>
              </div>
            )}
            <div className="card-amber" style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '0.625rem', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src="/icons/icon.svg" alt="" style={{ width: 22, height: 22 }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tabeza Crew</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Add to home screen</div>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Tap <strong>Share</strong> (iOS) or <strong>⋮ menu</strong> (Android) → &ldquo;Add to Home Screen&rdquo;
              </p>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginBottom: '0.625rem' }}
              onClick={() => router.push('/waiter')}>
              Go to Dashboard
            </button>
            <button className="btn-ghost" style={{ width: '100%' }}
              onClick={() => router.push('/waiter')}>
              Skip for now
            </button>
          </div>
        )}

        {step === 'method' && (
          <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--amber)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        )}
      </div>

      <p style={{ marginTop: '2.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Tabeza · crew.tabeza.co.ke
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
