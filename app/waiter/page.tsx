'use client'

import { useState, useEffect } from 'react'
import { getStoredProfilePhotoUrl } from '@/lib/profile-photo'
import { useRouter } from 'next/navigation'
import { Clock, AlertTriangle, LogOut, Bell, Star, MapPin, ChevronRight, Briefcase } from 'lucide-react'
import { FaceBubble } from '@/components/shared/FaceBubble'
import { StatCard } from '@/components/shared/StatCard'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { TableCard } from '@/components/home/TableCard'
import { CheckoutModal } from '@/components/home/CheckoutModal'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import type { AssignedTab, NearbyVenue } from '@/lib/types'

// ─── Preview toggle ───────────────────────────────────────────────────────────
// null = production (uses real auth, no active shift for new users)
// 'active' | 'ending_soon' = force a UI state for local dev
type HomeState = 'no_shift' | 'active' | 'ending_soon'
const PREVIEW_STATE: HomeState | null = null

export default function HomePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Real identity from session — no mock fallback
  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'there'
  const storedPhotoUrl = getStoredProfilePhotoUrl()

  const firstName = displayName.split(' ')[0]

  // Shift data from API
  const [activeShifts, setActiveShifts] = useState<any[]>([])
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([])
  const [assignedTabs, setAssignedTabs] = useState<AssignedTab[]>([])
  const [shiftState, setShiftState] = useState<HomeState>('no_shift')
  const [loading, setLoading] = useState(true)

  // Load shift data
  useEffect(() => {
    if (!user?.id) return
    async function loadShifts() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token
        if (!accessToken) return
        const res = await fetch('/api/shifts', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json()
        setActiveShifts(data.activeShifts || [])
        setUpcomingShifts(data.upcomingShifts || [])
        setAssignedTabs(data.assignedTabs || [])
        setShiftState(data.activeShifts?.length > 0 ? 'active' : 'no_shift')
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }
    loadShifts()
  }, [user?.id])

  // No unread notifications for new users
  const unreadCount = 0

  // ── No active shift ─────────────────────────────────────────────────────
  if (shiftState === 'no_shift') {
    const venuesWithSlots: any[] = [] // Will load from API
    const venuesNoSlots: any[] = [] // Will load from API

    return (
      <div className="page-content">

        {/* ── Header row ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
          <FaceBubble displayName={displayName} photoUrl={storedPhotoUrl} size="lg" />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Good evening, {firstName} 👋
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              No active shift · {venuesWithSlots.length} opening{venuesWithSlots.length !== 1 ? 's' : ''} nearby
            </p>
          </div>
          <button
            onClick={() => router.push('/waiter/notifications')}
            style={{
              position: 'relative', width: 36, height: 36, borderRadius: '0.5rem',
              background: 'var(--background-secondary)',
              border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--error)', color: '#fff',
                fontSize: '0.6rem', fontWeight: 700,
                minWidth: 16, height: 16, borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px', border: '2px solid var(--background-primary)',
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* No upcoming shift for new users — will show when real shift data exists */}

        {/* ── Open slots nearby ──────────────────────────────── */}
        {venuesWithSlots.length > 0 && (
          <>
            <SectionHeading
              title="Open slots nearby"
              description="Venues on Tabeza with shifts available right now"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
              {venuesWithSlots.map(venue => (
                <VenueCard key={venue.id} venue={venue} onApply={() => router.push('/waiter/jobs')} />
              ))}
            </div>
          </>
        )}

        {/* ── How to grow your rating ───────────────────────── */}
        <SectionHeading
          title="Grow your profile"
          description="Small habits that build your reputation"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
          {GUIDE_TIPS.map(tip => (
            <GuideTile key={tip.id} tip={tip} />
          ))}
        </div>

        {/* ── Other venues (no current opening) ─────────────── */}
        {venuesNoSlots.length > 0 && (
          <>
            <SectionHeading
              title="More venues on Tabeza"
              description="No current openings — check back or browse the jobs board"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {venuesNoSlots.map(venue => (
                <div
                  key={venue.id}
                  className="card"
                  style={{ padding: '0.875rem 1rem', opacity: 0.7 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {venue.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.2rem' }}>
                        <MapPin size={11} style={{ color: 'var(--text-tertiary)' }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {venue.location} · {venue.distance}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={12} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {venue.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Browse all jobs CTA ────────────────────────────── */}
        <button
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
          onClick={() => router.push('/waiter/jobs')}
        >
          <Briefcase size={16} />
          Browse all job openings
        </button>

      </div>
    )
  }

  // Active shift — real data will come from useActiveShift hook
  // Waiters see: tabs assigned to them + unassigned open tabs
  // Unassigned tabs appear so any on-shift waiter can claim a new customer
  const isEndingSoon = shiftState === 'ending_soon'
  const openTabs: AssignedTab[] = [] // TODO: replace with real tab data
  // When wired: filter tabs where current_staff_id = user's staff_id OR current_staff_id IS NULL

  return (
    <>
      <div className="page-content">
        {/* Shift header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <FaceBubble
            displayName={displayName}
            photoUrl={storedPhotoUrl}
            isOnShift
            size="lg"
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                On Shift
              </span>
              <span className="badge-pill badge-active">
                <span
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--success)', display: 'inline-block',
                  }}
                />
                On Shift
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <Clock size={12} />
              6:00 PM – 2:00 AM · 3h 22m in
            </div>
          </div>

          {/* Notification bell */}
          <button
            onClick={() => router.push('/waiter/notifications')}
            style={{
              position: 'relative', width: 36, height: 36, borderRadius: '0.5rem',
              background: 'var(--background-secondary)',
              border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--error)', color: '#fff',
                  fontSize: '0.6rem', fontWeight: 700,
                  minWidth: 16, height: 16, borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                  border: '2px solid var(--background-primary)',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Ending-soon warning banner */}
        {isEndingSoon && (
          <div className="shift-warning-banner">
            <AlertTriangle size={18} style={{ color: 'var(--amber)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Your shift ends in 28 minutes
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {openTabs.length} tables still open — clear or hand off before checkout
              </div>
            </div>
          </div>
        )}

        {/* Today's stats strip — zeros for new users */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <StatCard label="Tips" value="KES 0" accent />
          <StatCard label="Orders" value="0" sublabel="approved" />
          <StatCard label="Points" value="+0" sublabel="today" />
        </div>

        {/* My Tables */}
        <SectionHeading
          title="My Tables"
          description={openTabs.length === 0
            ? 'No active tables — new customer tabs will appear here'
            : `${openTabs.length} active · unassigned tabs also shown`}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
          {openTabs.map(tab => (
            <TableCard key={tab.id} tab={tab} onTap={() => router.push(`/waiter/tabs/${tab.id}`)} />
          ))}
        </div>

        {/* Checkout button */}
        <button
          className={isEndingSoon && openTabs.length > 0 ? 'btn-ghost' : 'btn-primary'}
          style={{ width: '100%', gap: '0.5rem' }}
          onClick={() => setCheckoutOpen(true)}
          disabled={isEndingSoon && openTabs.length > 0}
        >
          {isEndingSoon && openTabs.length > 0 ? (
            <>
              <AlertTriangle size={16} />
              Clear all tables to check out
            </>
          ) : (
            <>
              <LogOut size={16} />
              Check Out
            </>
          )}
        </button>
      </div>

      {checkoutOpen && (
        <CheckoutModal
          shiftSummary={{ orders: 0, tips: 0, points: 0, hoursWorked: '0h' }}
          onClose={() => setCheckoutOpen(false)}
          onConfirm={async () => {
            await signOut()
            router.replace('/auth/login')
          }}
        />
      )}
    </>
  )
}

// ─── Off-shift sub-components ────────────────────────────────────────────────

function VenueCard({ venue, onApply }: { venue: NearbyVenue; onApply: () => void }) {
  return (
    <div
      className="card"
      style={{
        borderLeft: venue.isRecentlyWorked ? '3px solid var(--amber)' : '3px solid var(--border-default)',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {venue.name}
            </span>
            {venue.isRecentlyWorked && (
              <span
                style={{
                  fontSize: '0.6rem', fontWeight: 600,
                  background: 'var(--amber-pale)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  color: 'var(--amber)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                }}
              >
                Worked here
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <MapPin size={11} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {venue.location}{venue.distance ? ` · ${venue.distance}` : ''}
            </span>
            <span style={{ color: 'var(--border-default)' }}>·</span>
            <Star size={11} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {venue.rating}
            </span>
          </div>
        </div>
        {venue.openSlots > 0 && (
          <span className="badge-pill badge-active" style={{ flexShrink: 0 }}>
            {venue.openSlots} open
          </span>
        )}
      </div>

      {/* Slot detail */}
      {venue.slotRole && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--background-tertiary)',
            borderRadius: '0.5rem',
            padding: '0.625rem 0.75rem',
            marginBottom: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{venue.slotRole}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{venue.slotDate}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pay</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber)' }}>
                KES {venue.slotPay?.toLocaleString()}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
            {venue.slotStart} –<br />{venue.slotEnd}
          </div>
        </div>
      )}

      <button className="btn-primary" style={{ width: '100%' }} onClick={onApply}>
        Apply Now
      </button>
    </div>
  )
}

interface GuideTipData {
  id: string
  emoji: string
  title: string
  body: string
  cta?: string
  ctaHref?: string
}

const GUIDE_TIPS: GuideTipData[] = [
  {
    id: 'g-01',
    emoji: '📸',
    title: 'Add your photo',
    body: 'Profiles with a face photo get 3× more hire requests. Venues want to see who they\'re booking.',
    cta: 'Upload photo',
    ctaHref: '/waiter/me/photos',
  },
  {
    id: 'g-02',
    emoji: '⭐',
    title: 'Get customer reactions',
    body: 'Every like or comment a customer leaves bumps your rating. Introduce yourself at the table — it works.',
  },
  {
    id: 'g-03',
    emoji: '💸',
    title: 'Tips show up on your profile',
    body: 'Total tips earned is one of the first things a manager sees. Great service compounds over time.',
  },
  {
    id: 'g-04',
    emoji: '🗓️',
    title: 'Set your availability',
    body: 'Venues can only find you on nights you\'re marked available. Keep it up-to-date to get more offers.',
    cta: 'Update availability',
    ctaHref: '/waiter/me/availability',
  },
  {
    id: 'g-05',
    emoji: '🥇',
    title: 'Work toward Gold',
    body: '150 shifts and a 4.5★ average unlocks Gold Waiter. Gold-only shifts pay more and are less competitive.',
  },
]

function GuideTile({ tip }: { tip: GuideTipData }) {
  const router = useRouter()
  return (
    <div
      className="card"
      style={{ padding: '1rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}
    >
      <div
        style={{
          width: 40, height: 40, borderRadius: '0.75rem',
          background: 'var(--amber-pale)',
          border: '1px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem', flexShrink: 0,
        }}
      >
        {tip.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          {tip.title}
        </div>
        <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          {tip.body}
        </p>
        {tip.cta && tip.ctaHref && (
          <button
            onClick={() => router.push(tip.ctaHref!)}
            style={{
              marginTop: '0.625rem',
              fontSize: '0.775rem',
              fontWeight: 600,
              color: 'var(--amber)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {tip.cta} <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
