'use client'

import { useRouter } from 'next/navigation'
import { Smartphone, Share, MoreHorizontal, PlusSquare } from 'lucide-react'

export default function InstallPage() {
  const router = useRouter()

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--background-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 80, height: 80, borderRadius: '1.25rem',
          background: 'var(--amber)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '2rem',
          boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
        }}
      >
        🍽️
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Tabeza Crew
      </h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5, maxWidth: 320 }}>
        Add Crew to your home screen for instant access to shifts, job offers, and your performance stats.
      </p>

      {/* iOS instructions */}
      <div className="card" style={{ width: '100%', maxWidth: 400, marginBottom: '1rem', textAlign: 'left' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Smartphone size={18} style={{ color: 'var(--amber)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            iPhone / iPad (Safari)
          </span>
        </div>
        {[
          { Icon: Share,       text: 'Tap the Share button at the bottom of Safari' },
          { Icon: PlusSquare,  text: 'Scroll down and tap "Add to Home Screen"' },
          { Icon: Smartphone,  text: 'Tap Add — the app appears on your home screen' },
        ].map(({ Icon, text }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: i < 2 ? '0.75rem' : 0 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--amber-pale)',
                border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={15} style={{ color: 'var(--amber)' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.4rem' }}>
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* Android instructions */}
      <div className="card" style={{ width: '100%', maxWidth: 400, marginBottom: '1.5rem', textAlign: 'left' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Smartphone size={18} style={{ color: 'var(--info, #3b82f6)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Android (Chrome)
          </span>
        </div>
        {[
          { Icon: MoreHorizontal, text: 'Tap the ⋮ menu in the top-right of Chrome' },
          { Icon: PlusSquare,     text: 'Tap "Add to Home Screen"' },
          { Icon: Smartphone,     text: 'Tap Add — the app appears on your home screen' },
        ].map(({ Icon, text }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: i < 2 ? '0.75rem' : 0 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={15} style={{ color: '#3b82f6' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.4rem' }}>
              {text}
            </p>
          </div>
        ))}
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%', maxWidth: 400 }}
        onClick={() => router.push('/waiter')}
      >
        Continue to App
      </button>

      <p style={{ marginTop: '2rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
        No download needed · Works in your browser · Free
      </p>
    </div>
  )
}
