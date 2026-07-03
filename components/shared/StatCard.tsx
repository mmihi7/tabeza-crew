interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  accent?: boolean
}

export function StatCard({ label, value, sublabel, accent = false }: StatCardProps) {
  return (
    <div
      className={accent ? 'card-amber' : 'card'}
      style={{ textAlign: 'center', padding: '1rem 0.75rem' }}
    >
      <div
        style={{
          fontSize: '0.65rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--amber)',
          marginBottom: '0.375rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div
          style={{
            fontSize: '0.65rem',
            color: 'var(--text-secondary)',
            marginTop: '0.25rem',
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  )
}
