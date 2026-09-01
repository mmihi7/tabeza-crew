'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  MapPin, Phone, Star, Users, Clock, ArrowLeft,
  Briefcase, Banknote, HeartHandshake, ThumbsUp, Menu as MenuIcon
} from 'lucide-react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { formatCurrency } from '@/lib/utils'

interface VenueData {
  venue: {
    id: string
    name: string
    address: string | null
    location: string | null
    area: string | null
    latitude: number | null
    longitude: number | null
    logo_url: string | null
    phone: string | null
    business_hours_mode: string | null
    business_hours_simple: unknown
  }
  menu: {
    id: string
    name: string
    description: string | null
    category: string
    image_url: string | null
    sale_price: number
    is_promo: boolean | null
  }[]
  crew: {
    avg_payout_reliability: number
    avg_treatment: number
    avg_shifts_available: number
    review_count: number
  }
}

function ReputationBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const pct = Math.round((value / 5) * 100)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {icon}
          {label}
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value.toFixed(1)}/5</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, backgroundColor: 'var(--border-default)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--accent, #FF4F00)', borderRadius: 999 }} />
      </div>
    </div>
  )
}

export default function VenuePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [data, setData] = useState<VenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await fetch(`/api/venues/${id}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load venue')
        setData(json)
      } catch (e: any) {
        setError(e.message || 'Could not load venue')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', padding: '1.25rem' }}>
        <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading venue…</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', padding: '1.25rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error || 'Venue not found'}</div>
          <button onClick={() => router.back()} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Go back
          </button>
        </div>
      </div>
    )
  }

  const { venue, menu, crew } = data
  const hasReputation = crew.review_count > 0

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', padding: '1.25rem' }}>
      <button
        onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Venue identity */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: 'var(--border-default)', overflow: 'hidden', flexShrink: 0 }}>
            {venue.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={venue.logo_url} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {venue.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{venue.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <MapPin size={12} /> {venue.location || venue.address || venue.area || 'Location unavailable'}
              </span>
              {venue.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <Phone size={12} /> {venue.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Crew reputation */}
      <div className="card" style={{ padding: '1.25rem', marginTop: '0.875rem' }}>
        <SectionHeading title="What crew say" />
        {hasReputation ? (
          <div style={{ display: 'grid', gap: '0.875rem', marginTop: '0.75rem' }}>
            <ReputationBar icon={<Banknote size={14} />} label="Pays on time" value={crew.avg_payout_reliability} />
            <ReputationBar icon={<HeartHandshake size={14} />} label="Treatment of staff" value={crew.avg_treatment} />
            <ReputationBar icon={<Briefcase size={14} />} label="Shifts available" value={crew.avg_shifts_available} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
              <ThumbsUp size={12} /> Based on {crew.review_count} review{crew.review_count === 1 ? '' : 's'} from crew who&apos;ve worked here.
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            No crew reviews yet for this venue. Be the first to review after a shift.
          </div>
        )}
      </div>

      {/* Menu preview */}
      {menu.length > 0 && (
        <div className="card" style={{ padding: '1.25rem', marginTop: '0.875rem' }}>
          <SectionHeading title="Menu preview" />
          <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
            {menu.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.name}
                    {m.is_promo && <span style={{ marginLeft: '0.375rem', fontSize: '0.6rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase' }}>Promo</span>}
                  </div>
                  {m.description && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{m.description}</div>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {formatCurrency(m.sale_price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clock hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
        <Clock size={12} /> Reviews are anonymous and aggregated — only averages are shown.
      </div>
    </div>
  )
}
