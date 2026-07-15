'use client'

import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { Smartphone, Share, MoreHorizontal, PlusSquare, Download } from 'lucide-react'
import { usePwaInstall } from '@/hooks/usePwaInstall'

export default function InstallPage() {
  const router = useRouter()
  const { installState, triggerInstall, isIos } = usePwaInstall()

  async function handleInstall() {
    if (installState === 'prompted') {
      const accepted = await triggerInstall()
      if (accepted) router.push('/waiter')
    }
  }

  if (installState === 'installed') {
    // Already a PWA — skip straight to app
    router.replace('/waiter')
    return null
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
        padding: '2rem 1rem',
        textAlign: 'center',
      }}
    >
      {/* App icon */}
      <div style={{ margin: '0 auto 1rem', display: 'flex', justifyContent: 'center' }}>
        <Logo size="xl" />
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Tabeza Crew
      </h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 300, marginBottom: '2rem' }}>
        Add to your home screen for instant access — shifts, job offers, and tips at a tap.
      </p>

      {/* One-tap install for Chrome/Edge/Android */}
      {installState === 'prompted' && (
        <button
          className="btn-primary"
          style={{ minWidth: 220, marginBottom: '1.5rem', gap: '0.5rem' }}
          onClick={handleInstall}
        >
          <Download size={17} />
          Add to Home Screen
        </button>
      )}

      {/* Manual instructions */}
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* iOS Safari */}
        {(isIos || installState !== 'prompted') && (
          <div className="card" style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <Smartphone size={17} style={{ color: 'var(--amber)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                iPhone / iPad (Safari)
              </span>
            </div>
            {[
              { Icon: Share,       text: 'Tap the Share button at the bottom of Safari' },
              { Icon: PlusSquare,  text: 'Scroll down and tap "Add to Home Screen"' },
              { Icon: Smartphone,  text: 'Tap Add — Crew appears on your home screen' },
            ].map(({ Icon, text }, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: i < arr.length - 1 ? '0.75rem' : 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--amber-pale)', border: '1px solid rgba(200,134,26,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} style={{ color: 'var(--amber)' }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.35rem' }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Android Chrome */}
        {!isIos && (
          <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <Smartphone size={17} style={{ color: 'var(--info, #3b82f6)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Android (Chrome)
              </span>
            </div>
            {[
              { Icon: MoreHorizontal, text: 'Tap the ⋮ menu in the top-right of Chrome' },
              { Icon: PlusSquare,     text: 'Tap "Add to Home Screen"' },
              { Icon: Smartphone,     text: 'Tap Add — Crew appears on your home screen' },
            ].map(({ Icon, text }, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: i < arr.length - 1 ? '0.75rem' : 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} style={{ color: '#3b82f6' }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.35rem' }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>

      <button
        className="btn-ghost"
        style={{ minWidth: 200 }}
        onClick={() => router.push('/waiter')}
      >
        Continue in browser
      </button>

      <p style={{ marginTop: '2rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
        No download · Works in your browser · Free
      </p>
    </div>
  )
}