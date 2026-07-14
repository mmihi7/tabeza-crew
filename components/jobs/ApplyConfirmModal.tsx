import { X, Send, Loader } from 'lucide-react'
import type { ShiftPosting } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'

interface ApplyConfirmModalProps {
  posting: ShiftPosting
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function ApplyConfirmModal({ posting, onConfirm, onClose }: ApplyConfirmModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to send application')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Apply for Shift
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

        {/* Posting summary */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {posting.barName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            {posting.location}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Role: </span>
              <span style={{ fontWeight: 600 }}>{posting.role}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Date: </span>
              <span style={{ fontWeight: 600 }}>{posting.shiftDate}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Time: </span>
              <span style={{ fontWeight: 600 }}>{posting.shiftStart} – {posting.shiftEnd}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Pay: </span>
              <span style={{ fontWeight: 700, color: 'var(--amber)' }}>
                {formatCurrency(posting.payPerShift)} + tips
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Your profile and performance stats will be sent to {posting.barName}.
          The manager will review and respond within 24 hours.
        </p>

        {error && (
          <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.625rem', fontSize: '0.8rem', color: 'var(--error)' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button className="btn-ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirm}
            disabled={loading}
            style={{ flex: 1, gap: '0.375rem' }}
          >
            {loading ? <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={15} />}
            {loading ? 'Sending...' : 'Send Application'}
          </button>
        </div>
      </div>
    </div>
  )
}
