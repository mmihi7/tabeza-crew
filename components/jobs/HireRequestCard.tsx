import { Clock, MapPin } from 'lucide-react'
import { FaceBubble } from '@/components/shared/FaceBubble'
import type { HireRequest } from '@/lib/types'
import { formatCurrency, getHoursUntilExpiry } from '@/lib/mock-data'

interface HireRequestCardProps {
  request: HireRequest
  onAccept: () => void
  onDecline: () => void
}

export function HireRequestCard({ request, onAccept, onDecline }: HireRequestCardProps) {
  const hoursLeft = getHoursUntilExpiry(request.expiresAt)
  const isUrgent = hoursLeft <= 4

  return (
    <div
      className="card"
      style={{
        borderLeft: isUrgent ? '3px solid var(--amber)' : '3px solid var(--border-default)',
      }}
    >
      {/* Manager identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
        <FaceBubble
          displayName={request.managerName}
          photoUrl={request.managerFaceUrl}
          size="default"
        />
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {request.managerName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {request.barName}
          </div>
        </div>
        {isUrgent && (
          <span className="badge-pill badge-urgent" style={{ marginLeft: 'auto', flexShrink: 0 }}>
            Expires soon
          </span>
        )}
      </div>

      {/* Shift details */}
      <div
        style={{
          background: 'var(--background-tertiary)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          marginBottom: '0.875rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
          <div>
            <div className="text-micro">Date</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {request.shiftDate}
            </div>
          </div>
          <div>
            <div className="text-micro">Role</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {request.role}
            </div>
          </div>
          <div>
            <div className="text-micro">Hours</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {request.shiftStart} – {request.shiftEnd}
            </div>
          </div>
          <div>
            <div className="text-micro">Pay</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--amber)' }}>
              {formatCurrency(request.payAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Manager message */}
      {request.message && (
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            borderLeft: '2px solid var(--border-default)',
            paddingLeft: '0.625rem',
            marginBottom: '0.875rem',
            lineHeight: 1.5,
          }}
        >
          &ldquo;{request.message}&rdquo;
        </p>
      )}

      {/* Expiry */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.7rem',
          color: isUrgent ? 'var(--warning)' : 'var(--text-tertiary)',
          marginBottom: '1rem',
        }}
      >
        <Clock size={12} />
        Expires in {hoursLeft} hour{hoursLeft !== 1 ? 's' : ''}
      </div>

      <div style={{ display: 'flex', gap: '0.625rem' }}>
        <button
          style={{
            flex: 1,
            padding: '0.625rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            background: 'rgba(239,68,68,0.10)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: 'var(--error)',
            transition: 'background-color 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onDecline}
        >
          Decline
        </button>
        <button
          className="btn-primary"
          style={{ flex: 1 }}
          onClick={onAccept}
        >
          Accept Shift
        </button>
      </div>
    </div>
  )
}
