'use client'

import { useState } from 'react'
import { Clock, AlertTriangle, LogOut } from 'lucide-react'
import { FaceBubble } from '@/components/shared/FaceBubble'
import { StatCard } from '@/components/shared/StatCard'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { TableCard } from '@/components/home/TableCard'
import { CheckoutModal } from '@/components/home/CheckoutModal'
import {
  MOCK_STAFF,
  MOCK_ACTIVE_SHIFT,
  MOCK_UPCOMING_SHIFT,
  MOCK_ASSIGNED_TABS,
  formatCurrency,
} from '@/lib/mock-data'

// Toggle this to preview both states during UI development
type HomeState = 'no_shift' | 'active' | 'ending_soon'
const PREVIEW_STATE: HomeState = 'active'

export default function HomePage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const staff = MOCK_STAFF

  // ── No active shift ─────────────────────────────────────────────────────
  if (PREVIEW_STATE === 'no_shift') {
    return (
      <div className="page-content">
        {/* Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
          <FaceBubble displayName={staff.displayName} badgeTier={staff.badgeTier} showBadge size="lg" />
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Good evening, {staff.displayName.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              No active shift
            </p>
          </div>
        </div>

        {/* Upcoming shift card */}
        <div className="card-amber" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <div className="text-label">Upcoming Shift</div>
            <span className="badge-pill badge-pending">Scheduled</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {MOCK_UPCOMING_SHIFT.barName}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
            Tomorrow 6:00 PM – 2:00 AM · {MOCK_UPCOMING_SHIFT.role}
            {MOCK_UPCOMING_SHIFT.payAmount && (
              <span style={{ color: 'var(--amber)', fontWeight: 600 }}>
                {' '}· {formatCurrency(MOCK_UPCOMING_SHIFT.payAmount)}
              </span>
            )}
          </div>
          <button className="btn-primary" style={{ width: '100%' }}>
            Check In When You Arrive
          </button>
        </div>

        {/* Today at a glance */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="text-label" style={{ marginBottom: '0.875rem' }}>Today at a glance</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem' }}>
            <StatCard label="Earnings" value="KES 0" />
            <StatCard label="Tips" value="KES 0" />
            <StatCard label="Orders" value="0" sublabel="approved" />
          </div>
        </div>

        {/* Browse jobs CTA */}
        <button
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => window.location.href = '/waiter/jobs'}
        >
          Browse Job Openings →
        </button>
      </div>
    )
  }

  // ── Active / Ending soon shift ──────────────────────────────────────────
  const isEndingSoon = PREVIEW_STATE === 'ending_soon'
  const openTabs = MOCK_ASSIGNED_TABS

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
            displayName={staff.displayName}
            badgeTier={staff.badgeTier}
            showBadge
            isOnShift
            size="lg"
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {MOCK_ACTIVE_SHIFT.barName}
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

        {/* Today's stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <StatCard label="Tips" value="KES 350" accent />
          <StatCard label="Orders" value="12" sublabel="approved" />
          <StatCard label="Points" value="+84" sublabel="today" />
        </div>

        {/* My Tables */}
        <SectionHeading title="My Tables" description={`${openTabs.length} active`} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
          {openTabs.map(tab => (
            <TableCard key={tab.id} tab={tab} />
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
          shiftSummary={{ orders: 12, tips: 350, points: 84, hoursWorked: '3h 22m' }}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </>
  )
}
