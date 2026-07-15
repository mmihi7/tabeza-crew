import { ChevronRight, Clock, DollarSign } from 'lucide-react'
import type { AssignedTab } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface TableCardProps {
  tab: AssignedTab
  onTap?: () => void
}

export function TableCard({ tab, onTap }: TableCardProps) {
  return (
    <button
      className="card"
      onClick={onTap}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'box-shadow 0.15s',
        position: 'relative',
      }}
    >
      {/* Table number circle */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '0.5rem',
          background: 'var(--amber-pale)',
          border: '1px solid rgba(255,79,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: '0.55rem', color: 'var(--amber)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Table
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--amber)', lineHeight: 1 }}>
          {tab.tableNumber}
        </div>
      </div>

      {/* Tab info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {tab.customerName}
          </span>
          {tab.hasPendingOrder && (
            <span className="badge-pill badge-pending" style={{ padding: '0.15rem 0.5rem' }}>
              <Clock size={10} />
              Pending approval
            </span>
          )}
          {tab.hasTip && (
            <span className="badge-pill badge-active" style={{ padding: '0.15rem 0.5rem' }}>
              <DollarSign size={10} />
              Tip!
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {formatCurrency(tab.currentBalance)} · {tab.roundCount} {tab.roundCount === 1 ? 'round' : 'rounds'}
        </div>
      </div>

      <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
    </button>
  )
}
