import { X, CheckCircle, AlertTriangle } from 'lucide-react'
import type { HireRequest } from '@/lib/types'
import { formatCurrency } from '@/lib/mock-data'

interface AcceptShiftModalProps {
  request: HireRequest
  onConfirm: () => void
  onClose: () => void
}

export function AcceptShiftModal({ request, onConfirm, onClose }: AcceptShiftModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Confirm Shift
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid var(--border-default)',
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Shift details summary */}
        <div className="card-amber" style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {request.barName}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Date: </span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{request.shiftDate}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Role: </span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{request.role}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Time: </span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {request.shiftStart} – {request.shiftEnd}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Pay: </span>
              <span style={{ fontWeight: 700, color: 'var(--amber)' }}>
                {formatCurrency(request.payAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Commitment notice */}
        <div
          style={{
            display: 'flex',
            gap: '0.625rem',
            padding: '0.75rem',
            background: 'rgba(245,158,11,0.06)',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <AlertTriangle size={16} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            By accepting, you commit to this shift. Last-minute cancellations affect your
            rating and may reduce future hire offers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={onConfirm}
            style={{ flex: 1, gap: '0.375rem' }}
          >
            <CheckCircle size={16} />
            Confirm Accept
          </button>
        </div>
      </div>
    </div>
  )
}
