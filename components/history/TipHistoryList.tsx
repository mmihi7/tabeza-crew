import { Copy } from 'lucide-react'
import type { TipRecord } from '@/lib/types'
import { formatCurrency } from '@/lib/mock-data'

interface TipHistoryListProps {
  tips: TipRecord[]
  totalMonth: number
}

export function TipHistoryList({ tips, totalMonth }: TipHistoryListProps) {
  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {})
  }

  if (tips.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '2rem' }}>💸</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          No tips this month
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Month total banner */}
      <div
        className="card-amber"
        style={{ textAlign: 'center', marginBottom: '1rem', padding: '1rem' }}
      >
        <div style={{ fontSize: '0.7rem', color: 'var(--amber)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          This month
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {formatCurrency(totalMonth)}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          {tips.length} tips received
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tips.map((tip) => (
          <div key={tip.id} className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Left: amount + source */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.125rem', flexShrink: 0,
                  }}
                >
                  💸
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(tip.amount)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {tip.fromName} · Table {tip.tableNumber}
                  </div>
                </div>
              </div>

              {/* Right: date */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tip.date}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{tip.barName}</div>
              </div>
            </div>

            {/* Mpesa code row */}
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: '0.625rem',
                padding: '0.375rem 0.625rem',
                background: 'var(--background-tertiary)',
                borderRadius: '0.375rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Mpesa
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {tip.mpesaCode}
                </span>
              </div>
              <button
                onClick={() => copyCode(tip.mpesaCode)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.7rem', color: 'var(--amber)', fontWeight: 500,
                }}
              >
                <Copy size={12} />
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
