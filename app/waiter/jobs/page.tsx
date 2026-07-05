'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Navigation, Loader, ChevronDown } from 'lucide-react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { HireRequestCard } from '@/components/jobs/HireRequestCard'
import { JobPostingCard } from '@/components/jobs/JobPostingCard'
import { AcceptShiftModal } from '@/components/jobs/AcceptShiftModal'
import { DeclineShiftModal } from '@/components/jobs/DeclineShiftModal'
import { ApplyConfirmModal } from '@/components/jobs/ApplyConfirmModal'
import { MOCK_HIRE_REQUESTS, MOCK_JOB_POSTINGS } from '@/lib/mock-data'
import type { HireRequest, ShiftPosting } from '@/lib/types'

type JobsTab = 'requests' | 'openings'
type RadiusKm = 5 | 20 | 70 | 100 | 'all'
type LocationState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'

const RADIUS_OPTIONS: { value: RadiusKm; label: string }[] = [
  { value: 5,     label: '5 km'   },
  { value: 20,    label: '20 km'  },
  { value: 70,    label: '70 km'  },
  { value: 100,   label: '100 km' },
  { value: 'all', label: 'All'    },
]

// Haversine distance in km — pure browser math, no API needed
function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

export default function JobsPage() {
  const [activeTab, setActiveTab]       = useState<JobsTab>('requests')
  const [radius, setRadius]             = useState<RadiusKm>(20)
  const [locationState, setLocationState] = useState<LocationState>('idle')
  const [userLat, setUserLat]           = useState<number | null>(null)
  const [userLng, setUserLng]           = useState<number | null>(null)
  const [locationLabel, setLocationLabel] = useState<string>('')
  const [acceptTarget, setAcceptTarget] = useState<HireRequest | null>(null)
  const [declineTarget, setDeclineTarget] = useState<HireRequest | null>(null)
  const [applyTarget, setApplyTarget]   = useState<ShiftPosting | null>(null)

  const pendingRequests = MOCK_HIRE_REQUESTS.filter(r => r.status === 'pending')

  // ── Request browser location ───────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState('unsupported')
      return
    }
    setLocationState('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setLocationState('granted')
        // Reverse-geocode neighbourhood name via Nominatim (free, no key)
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'TabezaCrew/1.0' } }
        )
          .then(r => r.json())
          .then(data => {
            const area =
              data.address?.suburb ||
              data.address?.neighbourhood ||
              data.address?.quarter ||
              data.address?.city_district ||
              data.address?.city ||
              'Your area'
            setLocationLabel(area)
          })
          .catch(() => setLocationLabel('Your area'))
      },
      (err) => {
        console.warn('Geolocation error:', err.message)
        setLocationState('denied')
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }, [])

  // ── Filter postings by radius ──────────────────────────────────────────
  const filteredPostings: (ShiftPosting & { distanceKm?: number })[] =
    MOCK_JOB_POSTINGS
      .map(p => {
        if (!userLat || !userLng || !p.lat || !p.lng || radius === 'all') {
          return { ...p, distanceKm: undefined }
        }
        return { ...p, distanceKm: haversineKm(userLat, userLng, p.lat, p.lng) }
      })
      .filter(p => {
        if (radius === 'all' || p.distanceKm === undefined) return true
        return p.distanceKm <= (radius as number)
      })
      .sort((a, b) => {
        if (a.distanceKm === undefined || b.distanceKm === undefined) return 0
        return a.distanceKm - b.distanceKm
      })

  return (
    <>
      <div className="page-content">
        {/* ── Page header ──────────────────────────────────────────── */}
        <div style={{ marginBottom: '0.25rem' }}>
          <h1 className="text-page-title">Jobs</h1>
          <p className="text-subtitle">
            {locationState === 'granted' && locationLabel
              ? `Near ${locationLabel}`
              : 'Nairobi · This Week'}
          </p>
        </div>

        {/* ── Sub-tab navigation ────────────────────────────────────── */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', marginBottom: '1.25rem', marginTop: '1rem' }}>
          {(['requests', 'openings'] as JobsTab[]).map((tab) => {
            const isActive = activeTab === tab
            const label = tab === 'requests'
              ? `Requests${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}`
              : 'Open Postings'
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem', fontWeight: 500,
                  background: 'none', border: 'none',
                  borderBottom: isActive ? '2px solid var(--amber)' : '2px solid transparent',
                  marginBottom: '-1px', cursor: 'pointer',
                  color: isActive ? 'var(--amber)' : 'var(--text-secondary)',
                  transition: 'color 0.15s',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* ── Requests tab ──────────────────────────────────────────── */}
        {activeTab === 'requests' && (
          <div>
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '2rem' }}>📭</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  No pending requests
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Venues will send hire offers when they find you in the marketplace
                </div>
              </div>
            ) : (
              <>
                <SectionHeading
                  title="Hire Requests"
                  description="Direct offers from venue managers — respond before they expire"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pendingRequests.map(request => (
                    <HireRequestCard
                      key={request.id}
                      request={request}
                      onAccept={() => setAcceptTarget(request)}
                      onDecline={() => setDeclineTarget(request)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Open Postings tab ─────────────────────────────────────── */}
        {activeTab === 'openings' && (
          <div>
            {/* Location + radius controls */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                marginBottom: '1.25rem', flexWrap: 'wrap',
              }}
            >
              {/* Location button */}
              <button
                onClick={requestLocation}
                disabled={locationState === 'requesting'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '999px',
                  fontSize: '0.775rem', fontWeight: 600,
                  cursor: locationState === 'requesting' ? 'default' : 'pointer',
                  border: '1px solid',
                  borderColor: locationState === 'granted'
                    ? 'rgba(16,185,129,0.35)'
                    : locationState === 'denied'
                      ? 'rgba(239,68,68,0.35)'
                      : 'var(--border-default)',
                  background: locationState === 'granted'
                    ? 'rgba(16,185,129,0.08)'
                    : locationState === 'denied'
                      ? 'rgba(239,68,68,0.08)'
                      : 'var(--background-secondary)',
                  color: locationState === 'granted'
                    ? 'var(--success)'
                    : locationState === 'denied'
                      ? 'var(--error)'
                      : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {locationState === 'requesting'
                  ? <Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                  : locationState === 'granted'
                    ? <Navigation size={13} />
                    : <MapPin size={13} />
                }
                {locationState === 'idle'       && 'Use My Location'}
                {locationState === 'requesting' && 'Locating…'}
                {locationState === 'granted'    && (locationLabel || 'Located')}
                {locationState === 'denied'     && 'Location denied'}
                {locationState === 'unsupported' && 'Not supported'}
              </button>

              {/* Radius selector — only shown when location is granted */}
              {locationState === 'granted' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {RADIUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setRadius(opt.value)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem', fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: radius === opt.value ? 'var(--amber)' : 'var(--border-default)',
                        background: radius === opt.value ? 'var(--amber-pale)' : 'var(--background-secondary)',
                        color: radius === opt.value ? 'var(--amber)' : 'var(--text-secondary)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Denied / unsupported hint */}
            {locationState === 'denied' && (
              <div style={{
                padding: '0.75rem 1rem', marginBottom: '1rem',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '0.625rem',
                fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                Location access was denied. Enable it in your browser settings to filter by distance, or browse all openings below.
              </div>
            )}

            {/* Results heading */}
            <SectionHeading
              title={
                locationState === 'granted' && radius !== 'all'
                  ? `${filteredPostings.length} opening${filteredPostings.length !== 1 ? 's' : ''} within ${radius} km`
                  : `${filteredPostings.length} opening${filteredPostings.length !== 1 ? 's' : ''} on Tabeza`
              }
              description="Verified shifts at Tabeza venues"
            />

            {filteredPostings.length === 0 ? (
              <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                <div style={{ fontSize: '2rem' }}>🔍</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  No openings within {radius} km
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Try a wider radius or browse all openings
                </div>
                <button
                  className="btn-ghost"
                  style={{ marginTop: '0.875rem', fontSize: '0.8rem' }}
                  onClick={() => setRadius('all')}
                >
                  Show all openings
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredPostings.map(posting => (
                  <div key={posting.id}>
                    {posting.distanceKm !== undefined && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.7rem', color: 'var(--text-tertiary)',
                        marginBottom: '0.25rem', paddingLeft: '0.25rem',
                      }}>
                        <MapPin size={10} />
                        {posting.distanceKm < 1
                          ? `${Math.round(posting.distanceKm * 1000)} m away`
                          : `${posting.distanceKm.toFixed(1)} km away`}
                      </div>
                    )}
                    <JobPostingCard
                      posting={posting}
                      onApply={() => setApplyTarget(posting)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {acceptTarget && (
        <AcceptShiftModal
          request={acceptTarget}
          onConfirm={() => { alert(`Accepted shift at ${acceptTarget.barName}!`); setAcceptTarget(null) }}
          onClose={() => setAcceptTarget(null)}
        />
      )}
      {declineTarget && (
        <DeclineShiftModal
          request={declineTarget}
          onConfirm={(reason, message) => { alert(`Declined: ${reason}`); setDeclineTarget(null) }}
          onClose={() => setDeclineTarget(null)}
        />
      )}
      {applyTarget && (
        <ApplyConfirmModal
          posting={applyTarget}
          onConfirm={() => { alert(`Applied to ${applyTarget.barName}!`); setApplyTarget(null) }}
          onClose={() => setApplyTarget(null)}
        />
      )}
    </>
  )
}
