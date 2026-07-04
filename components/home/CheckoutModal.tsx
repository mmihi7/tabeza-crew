import { CheckCircle, X } from 'lucide-react'

interface CheckoutModalProps {
  shiftSummary: {
    orders: number
    tips: number
    points: number
    hoursWorked: string
  }
  onClose: () => void
  onConfirm?: () => void | Promise<void>
}

export function CheckoutModal({ shiftSummary, onClose, onConfirm }: CheckoutModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Check Out
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid var(--border-default)',
              background: 'var(--background-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Shift summary */}
        <div className="card" style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 0.75rem' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
            Great work tonight!
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            You worked {shiftSummary.hoursWorked} at The Alchemist
          </div>

          <div className="divider" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Orders Approved
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {shiftSummary.orders}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Tips Earned
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                KES {shiftSummary.tips}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Points
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                +{shiftSummary.points}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Rating
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ⭐ 4.8
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            onClick={() => onConfirm ? onConfirm() : onClose()}
          >
            Confirm Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
