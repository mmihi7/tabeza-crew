'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MapPin, Navigation, Loader, CheckCircle, XCircle } from 'lucide-react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { HireRequestCard } from '@/components/jobs/HireRequestCard'
import { JobPostingCard } from '@/components/jobs/JobPostingCard'
import { AcceptShiftModal } from '@/components/jobs/AcceptShiftModal'
import { DeclineShiftModal } from '@/components/jobs/DeclineShiftModal'
import { ApplyConfirmModal } from '@/components/jobs/ApplyConfirmModal'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useUnreadCounts } from '@/hooks/useUnreadCounts'
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

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
  const { user } = useAuth()
  const { notifyCountsChanged } = useUnreadCounts()
  const [activeTab, setActiveTab]         = useState<JobsTab>('openings')
  const [radius, setRadius]               = useState<RadiusKm>(20)
  const [locationState, setLocationState] = useState<LocationState>('idle')
  const [userLat, setUserLat]             = useState<number | null>(null)
  const [userLng, setUserLng]             = useState<number | null>(null)
  const [locationLabel, setLocationLabel] = useState<string>('')
  const [acceptTarget, setAcceptTarget]   = useState<HireRequest | null>(null)
  const [declineTarget, setDeclineTarget] = useState<HireRequest | null>(null)
  const [applyTarget, setApplyTarget]     = useState<ShiftPosting | null>(null)

  const [pendingRequests, setPendingRequests] = useState<HireRequest[]>([])
  const [allPostings, setAllPostings]         = useState<ShiftPosting[]>([])
  const [loadingJobs, setLoadingJobs]         = useState(true)
  const [jobsError, setJobsError]             = useState<string | null>(null)
  const [respondingId, setRespondingId]       = useState<string | null>(null)
  const [respondError, setRespondError]       = useState<string | null>(null)
  const [respondSuccess, setRespondSuccess]   = useState<string | null>(null)
  const [crewMemberId, setCrewMemberId]       = useState<string | null>(null)
  const [appliedPostingIds, setAppliedPostingIds] = useState<Set<string>>(new Set())
  const allPostingsRef = useRef(allPostings)
  useEffect(() => { allPostingsRef.current = allPostings }, [allPostings])

  // ── Load crew member ID on mount ──────────────────────────────
  useEffect(() => {
    async function getCrewId() {
      if (!user?.id) return
      const { data: crew } = await (supabase as any)
        .from('crew_members')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (crew?.id) setCrewMemberId(crew.id)
    }
    getCrewId()
  }, [user?.id])

  // ── Load hire requests + postings from API ──────────────────────────
  useEffect(() => {
    if (!user?.id) return
    async function loadJobs() {
      setLoadingJobs(true)
      setJobsError(null)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token
        if (!accessToken) {
          setJobsError('Session expired — please sign in again.')
          setLoadingJobs(false)
          return
        }
        const res = await fetch('/api/jobs', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json()
        if (!res.ok) {
          setJobsError(data.error || `Server error ${res.status}`)
          setLoadingJobs(false)
          return
        }

        if (data.hireRequests) {
          const pending = (data.hireRequests as any[]).filter(r => r.status === 'pending')
          setPendingRequests(pending.map(hr => ({
            id: hr.id,
            barName: hr.venue?.name || '',
            managerName: '',
            managerFaceUrl: undefined,
            role: hr.role || '',
            shiftDate: hr.shiftDate || '',
            shiftStart: hr.shiftStart || '',
            shiftEnd: hr.shiftEnd || '',
            payAmount: hr.payAmount || 0,
            message: hr.message || '',
            status: hr.status || 'pending',
            expiresAt: hr.expiresAt || '',
          })))
          if (pending.length > 0) setActiveTab('requests')
        }

        if (data.postings) {
          setAllPostings((data.postings as any[]).map(p => ({
            id: p.id,
            barName: p.venue?.name || '',
            barRating: 0,
            role: p.role || '',
            shiftDate: p.shiftDate || '',
            shiftStart: p.shiftStart || '',
            shiftEnd: p.shiftEnd || '',
            payPerShift: p.payPerShift || 0,
            slotsAvailable: p.slotsAvailable || 1,
            preferredTier: p.preferredTier || undefined,
            location: '',
            lat: p.lat,
            lng: p.lng,
          })))
        }
      } catch (err: any) {
        setJobsError(err.message || 'Failed to load jobs')
      } finally {
        setLoadingJobs(false)
      }
    }
    loadJobs()
  }, [user?.id])

  // ── Realtime: new shift postings ──────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase.channel('all-shift-postings')
    channel.on('postgres_changes' as any, {
      event: 'INSERT',
      schema: 'public',
      table: 'shift_postings',
      filter: 'status=eq.open',
    }, (payload: any) => {
      const p = payload.new
      if (!p?.id) return
      if (allPostingsRef.current.some(e => e.id === p.id)) return

      const newPosting: ShiftPosting = {
        id: p.id, barName: '', barRating: 0,
        role: p.role || '', shiftDate: p.shift_date || '',
        shiftStart: p.shift_start || '', shiftEnd: p.shift_end || '',
        payPerShift: p.pay_per_shift || 0, slotsAvailable: p.slots_available || 1,
        preferredTier: p.preferred_performance_tier || undefined,
        location: '', lat: p.latitude || undefined, lng: p.longitude || undefined,
      }
      if (p.bar_id) {
        ;(supabase as any).from('bars').select('name, display_name, latitude, longitude')
          .eq('id', p.bar_id).single()
          .then(({ data: bar }: any) => {
            if (bar) {
              newPosting.barName = bar.display_name || bar.name
              if (!newPosting.lat) newPosting.lat = bar.latitude
              if (!newPosting.lng) newPosting.lng = bar.longitude
            }
            setAllPostings(prev => [newPosting, ...prev])
          })
      } else {
        setAllPostings(prev => [newPosting, ...prev])
      }
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  // ── Realtime: new hire requests ───────────────────────────────
  useEffect(() => {
    if (!crewMemberId) return
    const channel = supabase.channel(`hire-requests-${crewMemberId}`)
    channel.on('postgres_changes' as any, {
      event: 'INSERT', schema: 'public', table: 'hire_requests',
      filter: `crew_member_id=eq.${crewMemberId}`,
    }, (payload: any) => {
      const hr = payload.new
      if (!hr?.id) return
      if (pendingRequests.some(e => e.id === hr.id)) return

      const newRequest: HireRequest = {
        id: hr.id, barName: '', managerName: '', managerFaceUrl: undefined,
        role: hr.role || '', shiftDate: hr.shift_date || '',
        shiftStart: hr.shift_start || '', shiftEnd: hr.shift_end || '',
        payAmount: hr.pay_amount || 0, message: hr.message || '',
        status: hr.status || 'pending', expiresAt: hr.expires_at || '',
      }
      if (hr.bar_id) {
        ;(supabase as any).from('bars').select('name, display_name').eq('id', hr.bar_id).single()
          .then(({ data: bar }: any) => {
            if (bar) newRequest.barName = bar.display_name || bar.name
            setPendingRequests(prev => [newRequest, ...prev])
            notifyCountsChanged()
          })
      } else {
        setPendingRequests(prev => [newRequest, ...prev])
        notifyCountsChanged()
      }
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [crewMemberId, pendingRequests, notifyCountsChanged])

  // ── Respond to hire request ───────────────────────────────────
  async function respondToHireRequest(hireRequestId: string, action: 'accepted' | 'declined', responseMessage?: string) {
    setRespondError(null)
    setRespondSuccess(null)
    setRespondingId(hireRequestId)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) { setRespondError('Please sign in again'); return }

      const res = await fetch('/api/jobs/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ hireRequestId, action, responseMessage }),
      })
      const data = await res.json()
      if (!res.ok) { setRespondError(data.error || 'Something went wrong'); return }

      setPendingRequests(prev => prev.filter(r => r.id !== hireRequestId))
      setRespondSuccess(data.message)
      setAcceptTarget(null)
      setDeclineTarget(null)
      notifyCountsChanged()
      setTimeout(() => setRespondSuccess(null), 4000)
    } catch (err: any) {
      setRespondError(err.message || 'Network error')
    } finally {
      setRespondingId(null)
    }
  }

  // ── Request browser location ──────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationState('unsupported'); return }
    setLocationState('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setLocationState('granted')
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'TabezaCrew/1.0' } }
        ).then(r => r.json()).then(data => {
          setLocationLabel(
            data.address?.suburb || data.address?.neighbourhood ||
            data.address?.quarter || data.address?.city_district ||
            data.address?.city || 'Your area'
          )
        }).catch(() => setLocationLabel('Your area'))
      },
      (err) => { console.warn('Geolocation error:', err.message); setLocationState('denied') },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }, [])

  // ── Filter postings by radius ─────────────────────────────────
  const filteredPostings: (ShiftPosting & { distanceKm?: number })[] = allPostings
    .map(p => {
      if (!userLat || !userLng || !p.lat || !p.lng || radius === 'all') return { ...p, distanceKm: undefined }
      return { ...p, distanceKm: haversineKm(userLat, userLng, p.lat, p.lng) }
    })
    .filter(p => radius === 'all' || p.distanceKm === undefined || p.distanceKm <= (radius as number))
    .sort((a, b) => {
      if (a.distanceKm === undefined || b.distanceKm === undefined) return 0
      return a.distanceKm - b.distanceKm
    })

  // ── Shared loading/error block ────────────────────────────────
  const LoadingBlock = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--border-default)', borderTopColor: 'var(--amber)', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
  const ErrorBlock = () => (
    <div style={{ padding: '0.875rem 1rem', marginBottom: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.625rem', fontSize: '0.825rem', color: 'var(--error)' }}>
      {jobsError}
    </div>
  )

  return (
    // ✅ Mobile portrait container - max-width: 480px, centered on desktop
    <div style={{ 
      background: '#ffffff', 
      minHeight: '100vh', 
      padding: '1rem 1rem 2rem',
      maxWidth: 480,
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '0.25rem' }}>
        <h1 className="text-page-title">Jobs</h1>
        <p className="text-subtitle">
          {locationState === 'granted' && locationLabel ? `Near ${locationLabel}` : 'Nairobi · This Week'}
        </p>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', marginBottom: '1.25rem', marginTop: '1rem' }}>
        {(['openings', 'requests'] as JobsTab[]).map(tab => {
          const isActive = activeTab === tab
          const label = tab === 'requests'
            ? `Requests${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}`
            : 'Open Postings'
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 500,
              background: 'none', border: 'none',
              borderBottom: isActive ? '2px solid var(--amber)' : '2px solid transparent',
              marginBottom: '-1px', cursor: 'pointer',
              color: isActive ? 'var(--amber)' : 'var(--text-secondary)',
              transition: 'color 0.15s',
            }}>
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Requests tab ─────────────────────────────────── */}
      {activeTab === 'requests' && (
        <div>
          {loadingJobs && <LoadingBlock />}
          {!loadingJobs && jobsError && <ErrorBlock />}
          {!loadingJobs && !jobsError && (
            <>
              {respondSuccess && (
                <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '0.625rem', fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} />{respondSuccess}
                </div>
              )}
              {respondError && (
                <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.625rem', fontSize: '0.85rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <XCircle size={16} />{respondError}
                </div>
              )}
              {pendingRequests.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '2rem' }}>📭</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No pending requests</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Venues will send hire offers when they find you in the marketplace</div>
                </div>
              ) : (
                <>
                  <SectionHeading title="Hire Requests" description="Direct offers from venue managers — respond before they expire" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pendingRequests.map(request => (
                      <div key={request.id} style={{ opacity: respondingId === request.id ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                        <HireRequestCard
                          request={request}
                          onAccept={() => setAcceptTarget(request)}
                          onDecline={() => setDeclineTarget(request)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Open Postings tab ────────────────────────────── */}
      {activeTab === 'openings' && (
        <div>
          {loadingJobs && <LoadingBlock />}
          {!loadingJobs && jobsError && <ErrorBlock />}
          {!loadingJobs && !jobsError && (
            <>
              {/* Location + radius controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <button
                  onClick={requestLocation}
                  disabled={locationState === 'requesting'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.5rem 0.875rem', borderRadius: '999px',
                    fontSize: '0.775rem', fontWeight: 600,
                    cursor: locationState === 'requesting' ? 'default' : 'pointer',
                    border: '1px solid',
                    borderColor: locationState === 'granted' ? 'rgba(16,185,129,0.35)' : locationState === 'denied' ? 'rgba(239,68,68,0.35)' : 'var(--border-default)',
                    background: locationState === 'granted' ? 'rgba(16,185,129,0.08)' : locationState === 'denied' ? 'rgba(239,68,68,0.08)' : 'var(--background-secondary)',
                    color: locationState === 'granted' ? 'var(--success)' : locationState === 'denied' ? 'var(--error)' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {locationState === 'requesting' ? <Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : locationState === 'granted' ? <Navigation size={13} /> : <MapPin size={13} />}
                  {locationState === 'idle'        && 'Use My Location'}
                  {locationState === 'requesting'  && 'Locating…'}
                  {locationState === 'granted'     && (locationLabel || 'Located')}
                  {locationState === 'denied'      && 'Location denied'}
                  {locationState === 'unsupported' && 'Not supported'}
                </button>
                {locationState === 'granted' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {RADIUS_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setRadius(opt.value)} style={{
                        padding: '0.375rem 0.75rem', borderRadius: '999px',
                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: '1px solid',
                        borderColor: radius === opt.value ? 'var(--amber)' : 'var(--border-default)',
                        background: radius === opt.value ? 'var(--amber-pale)' : 'var(--background-secondary)',
                        color: radius === opt.value ? 'var(--amber)' : 'var(--text-secondary)',
                        transition: 'all 0.15s',
                      }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {locationState === 'denied' && (
                <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.625rem', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Location access was denied. Enable it in your browser settings to filter by distance, or browse all openings below.
                </div>
              )}

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
                    {locationState === 'granted' && radius !== 'all' ? `No openings within ${radius} km` : 'No openings right now'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {locationState === 'granted' && radius !== 'all' ? 'Try a wider radius or browse all openings' : 'Check back soon — venues post shifts here'}
                  </div>
                  {locationState === 'granted' && radius !== 'all' && (
                    <button className="btn-ghost" style={{ marginTop: '0.875rem', fontSize: '0.8rem' }} onClick={() => setRadius('all')}>
                      Show all openings
                    </button>
                  )}
                </div>
              ) : (
                // ✅ TWO COLUMN GRID
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  {filteredPostings.map(posting => (
                    <div key={posting.id}>
                      {posting.distanceKm !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>
                          <MapPin size={9} />
                          {posting.distanceKm < 1 ? `${Math.round(posting.distanceKm * 1000)} m` : `${posting.distanceKm.toFixed(1)} km`}
                        </div>
                      )}
                      <JobPostingCard posting={posting} onApply={() => setApplyTarget(posting)} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {acceptTarget && (
        <AcceptShiftModal
          request={acceptTarget}
          onConfirm={() => respondToHireRequest(acceptTarget.id, 'accepted')}
          onClose={() => setAcceptTarget(null)}
        />
      )}
      {declineTarget && (
        <DeclineShiftModal
          request={declineTarget}
          onConfirm={(reason, message) => respondToHireRequest(declineTarget.id, 'declined', message || reason)}
          onClose={() => setDeclineTarget(null)}
        />
      )}
      {applyTarget && (
        <ApplyConfirmModal
          posting={applyTarget}
          onConfirm={async () => {
            const { data: sessionData } = await supabase.auth.getSession()
            const accessToken = sessionData.session?.access_token
            if (!accessToken) throw new Error('Please sign in again')
            const res = await fetch('/api/jobs/apply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify({ postingId: applyTarget.id }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to apply')
          }}
          onClose={() => setApplyTarget(null)}
        />
      )}
    </div>
  )
}