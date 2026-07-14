'use client'

import Image from 'next/image' // ✅ Added import

export default function OfflinePage() {
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
      {/* ✅ Brand icon in amber rounded-square container - matching login/signup/install */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '1.125rem',
          background: 'var(--amber)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 8px 24px rgba(245,158,11,0.30)',
        }}
      >
        <Image
          src="/icons/icon.svg"
          alt="Tabeza Crew"
          width={40}
          height={40}
          priority
        />
      </div>

      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        You&rsquo;re offline
      </h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280, marginBottom: '2rem' }}>
        No connection right now. Your last session data is still available — reconnect to sync.
      </p>

      <button
        className="btn-primary"
        style={{ minWidth: 160 }}
        onClick={() => window.location.reload()}
      >
        Try again
      </button>

      <p style={{ marginTop: '2rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
        Tabeza Crew · crew.tabeza.co.ke
      </p>
    </div>
  )
}