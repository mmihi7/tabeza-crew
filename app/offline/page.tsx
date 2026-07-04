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
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📡</div>

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
