'use client'

import { useState } from 'react'
import { Star, X, Banknote, HeartHandshake, Briefcase, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface VenueReviewModalProps {
  shiftId: string
  barName: string
  onClose: () => void
}

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const

export function VenueReviewModal({ shiftId, barName, onClose }: VenueReviewModalProps) {
  const [payout, setPayout] = useState(0)
  const [treatment, setTreatment] = useState(0)
  const [shiftsAvailable, setShiftsAvailable] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const allRated = payout > 0 && treatment > 0 && shiftsAvailable > 0

  const handleSubmit = async () => {
    if (!allRated) return
    setSubmitting(true)
    setError(null)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      const res = await fetch('/api/venue-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken || ''}`,
        },
        body: JSON.stringify({
          shift_id: shiftId,
          payout_reliability: payout,
          treatment,
          shifts_available: shiftsAvailable,
          comment: comment.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 409) {
          setError('This shift was already reviewed — thanks for helping out.')
        } else {
          setError(json?.error || 'Could not submit the review. Try again.')
        }
        return
      }
      setDone(true)
    } catch {
      setError('Network error — check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const RatingRow = ({
    label,
    icon,
    value,
    onChange,
  }: {
    label: string
    icon: React.ReactNode
    value: number
    onChange: (v: number) => void
  }) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {icon}
          {label}
        </span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {RATING_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              aria-label={`${label}: ${n}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.125rem',
                borderRadius: 6,
              }}
            >
              <Star
                size={20}
                style={{
                  color: n <= value ? 'var(--amber)' : 'var(--border-default)',
                  fill: n <= value ? 'var(--amber)' : 'transparent',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="modal-backdrop" onClick={done ? onClose : undefined}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {done ? 'Thanks!' : 'Rate this venue'}
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
            aria-label="Close"
          >
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0 0.5rem' }}>
            <CheckCircle size={44} style={{ color: 'var(--success)', margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              Review submitted
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Your feedback is aggregated anonymously — crew who work at {barName} next time will see the averages.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              How was working at <strong style={{ color: 'var(--text-primary)' }}>{barName}</strong>? Your ratings stay anonymous and are only shown as averages on the venue&apos;s profile.
            </div>

            <div style={{ display: 'grid', gap: '0.875rem', marginBottom: '1rem' }}>
              <RatingRow icon={<Banknote size={14} />} label="Pays on time" value={payout} onChange={setPayout} />
              <RatingRow icon={<HeartHandshake size={14} />} label="Treatment of staff" value={treatment} onChange={setTreatment} />
              <RatingRow icon={<Briefcase size={14} />} label="Shifts available" value={shiftsAvailable} onChange={setShiftsAvailable} />
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1200))}
              placeholder="Optional note for other staff (kept anonymous)"
              rows={3}
              style={{
                width: '100%',
                border: '1px solid var(--border-default)',
                borderRadius: '0.75rem',
                background: 'var(--background-secondary)',
                color: 'var(--text-primary)',
                padding: '0.625rem 0.75rem',
                fontSize: '0.8rem',
                resize: 'none',
                marginBottom: '0.875rem',
              }}
            />

            {error && (
              <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginBottom: '0.75rem' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!allRated || submitting}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: allRated && !submitting ? 'pointer' : 'not-allowed',
                background: allRated && !submitting ? 'var(--amber)' : 'var(--border-default)',
                color: allRated && !submitting ? '#fff' : 'var(--text-tertiary)',
              }}
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}