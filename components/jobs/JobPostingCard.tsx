import { Star, MapPin, Users } from 'lucide-react'
import type { ShiftPosting } from '@/lib/types'
import { formatCurrency, formatShiftTime } from '@/lib/utils'

interface JobPostingCardProps {
  posting: ShiftPosting
  onApply: () => void
  applied?: boolean
  accepted?: boolean
  onCheckin?: () => void
}

export function JobPostingCard({ posting, onApply, applied = false, accepted = false, onCheckin }: JobPostingCardProps) {
  const isAccepted = accepted && onCheckin
  return (
    <div className="card">
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {posting.barName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.2rem' }}>
            <Star size={12} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {posting.barRating}
            </span>
            <span style={{ color: 'var(--border-default)' }}>·</span>
            <MapPin size={12} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {posting.location}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--amber)' }}>
            {formatCurrency(posting.payPerShift)}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>+ tips</div>
        </div>
      </div>

      <hr className="divider" style={{ margin: '0.625rem 0' }} />

      {/* Details */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
        <div>
          <span className="text-micro">Role  </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {posting.role}
          </span>
        </div>
        <div>
          <span className="text-micro">Date  </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {posting.shiftDate}
          </span>
        </div>
        <div>
          <span className="text-micro">Time  </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {formatShiftTime(posting.shiftStart)} – {formatShiftTime(posting.shiftEnd)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {isAccepted ? (
            <span className="badge-pill" style={{
              padding: '0.15rem 0.5rem', fontSize: '0.65rem', fontWeight: 700,
              background: 'rgba(16,185,129,0.12)', color: 'var(--success)',
              border: '1px solid rgba(16,185,129,0.25)', borderRadius: '999px',
            }}>
              Accepted
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Users size={12} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                {posting.slotsAvailable} spot{posting.slotsAvailable !== 1 ? 's' : ''} left
              </span>
            </div>
          )}
          {posting.preferredTier === 'gold' && (
            <span className="badge-pill badge-pending">
              🥇 Gold preferred
            </span>
          )}
        </div>
        <button 
          className={isAccepted ? '' : 'btn-primary'}
          style={{ 
            padding: '0.4rem 1rem', fontSize: '0.8rem',
            ...(isAccepted ? {
              background: 'var(--amber)', border: 'none', borderRadius: '0.5rem',
              color: '#1a1a2e', fontWeight: 600, cursor: 'pointer',
            } : {}),
          }} 
          onClick={isAccepted ? onCheckin : onApply}
          disabled={applied && !isAccepted}
        >
          {isAccepted ? 'Check In' : applied ? 'Applied' : 'Apply'}
        </button>
      </div>
    </div>
  )
}
