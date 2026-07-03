'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { HireRequest } from '@/lib/types'

interface DeclineShiftModalProps {
  request: HireRequest
  onConfirm: (reason: string, message: string) => void
  onClose: () => void
}

const DECLINE_REASONS = [
  'Already booked another venue',
  'Time conflict',
  'Too far to travel',
  'Pay too low',
  'Other reason',
]

export function DeclineShiftModal({ request, onConfirm, onClose }: DeclineShiftModalProps) {
  const [selectedReason, setSelectedReason] = useState('')
  const [personalMessage, setPersonalMessage] = useState('')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Decline Shift
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

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Let {request.managerName} at {request.barName} know why you can&rsquo;t make it.
          This helps them find someone else quickly.
        </p>

        {/* Reason picker */}
        <div style={{ marginBottom: '1rem' }}>
          <label className="input-label">Reason (optional)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DECLINE_REASONS.map((reason) => (
              <label
                key={reason}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${selectedReason === reason ? 'var(--amber)' : 'var(--border-default)'}`,
                  background: selectedReason === reason ? 'var(--amber-pale)' : 'var(--background-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  name="decline-reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  style={{ accentColor: 'var(--amber)' }}
                />
                {reason}
              </label>
            ))}
          </div>
        </div>

        {/* Optional personal note */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="input-label">Personal message (optional)</label>
          <textarea
            className="input"
            placeholder="e.g. Sorry, I have a family event that day..."
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            rows={3}
            style={{ resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={() => onConfirm(selectedReason, personalMessage)}
            style={{
              flex: 1,
              padding: '0.625rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Decline Politely
          </button>
        </div>
      </div>
    </div>
  )
}
