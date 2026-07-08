import { Star, Clock, TrendingUp } from 'lucide-react'
import type { ShiftHistory } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface ShiftHistoryListProps {
  shifts: ShiftHistory[]
}

export function ShiftHistoryList({ shifts }: ShiftHistoryListProps) {
  if (shifts.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '2rem' }}>📅</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          No shifts this month
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {shifts.map((shift) => (
        <div key={shift.id} className="card">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {shift.barName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.2rem' }}>
                <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {shift.date} · {shift.startTime} – {shift.endTime} ({shift.durationHours}h)
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
              <Star size={13} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {shift.rating}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                ({shift.reviewCount})
              </span>
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--border-subtle)', margin: '0 0 0.625rem' }} />

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <TrendingUp size={13} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{shift.ordersApproved}</strong> orders
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(shift.tipsEarned)}</strong> tips
            </div>
          </div>
        </div>
      ))}

      {/* Monthly footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '0.75rem',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: '0.375rem',
        }}
      >
        {shifts.length} shifts this month ·{' '}
        {formatCurrency(shifts.reduce((s, sh) => s + sh.tipsEarned, 0))} tips earned
      </div>
    </div>
  )
}
