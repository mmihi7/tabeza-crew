'use client'

import Link from 'next/link'
import {
  Camera, ChevronRight, Bell, CreditCard, Shield,
  LogOut, Star, MapPin,
} from 'lucide-react'
import { FaceBubble } from '@/components/shared/FaceBubble'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { MOCK_STAFF, formatCurrency, getBadgeLabel } from '@/lib/mock-data'

export default function MePage() {
  const staff = MOCK_STAFF

  const venues = [
    { name: 'The Alchemist', shifts: 42 },
    { name: "J's Fresh Bar",  shifts: 18 },
    { name: 'Brew Bistro',    shifts:  9 },
  ]

  return (
    <div className="page-content">
      {/* ── Profile hero ──────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0.5rem 0 1.25rem',
        }}
      >
        <div style={{ position: 'relative', marginBottom: '0.875rem' }}>
          <FaceBubble
            displayName={staff.displayName}
            badgeTier={staff.badgeTier}
            showBadge
            isOnShift={false}
            size="xl"
          />
          <Link
            href="/waiter/me/photos"
            style={{
              position: 'absolute',
              bottom: 2,
              left: 2,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--amber)',
              border: '2px solid var(--background-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Camera size={14} style={{ color: '#1a1a2e' }} />
          </Link>
        </div>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
          {staff.displayName}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
          <Star size={14} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {staff.performanceScore}
          </span>
          <span style={{ color: 'var(--border-default)' }}>·</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {staff.totalShifts} shifts
          </span>
        </div>
        <span
          style={{
            display: 'inline-block',
            background: 'var(--amber-pale)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: '999px',
            padding: '0.2rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--amber)',
          }}
        >
          {getBadgeLabel(staff.badgeTier)}
        </span>

        <Link
          href="#"
          style={{
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--amber)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          View Public Profile →
        </Link>
      </div>

      {/* ── Performance stats ─────────────────────────────────────── */}
      <SectionHeading title="Performance" />
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem 1.5rem' }}>
          {[
            { label: 'Orders approved',   value: staff.totalApprovedOrders.toLocaleString() },
            { label: 'Approval rate',     value: `${staff.approvalRate}%` },
            { label: 'Tips earned',       value: formatCurrency(staff.totalTipsEarned) },
            { label: 'Customer likes',    value: staff.totalLikes.toLocaleString() },
            { label: 'Points',            value: `${staff.totalPoints.toLocaleString()} pts` },
            { label: 'Platform rank',     value: 'Top 8%' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>
                {label}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Venues worked ────────────────────────────────────────── */}
      <SectionHeading title="Venues Worked" />
      <div className="card" style={{ marginBottom: '1rem', padding: '0.875rem 1.25rem' }}>
        {venues.map((v, i) => (
          <div
            key={v.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0',
              borderBottom: i < venues.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{v.name}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {v.shifts} shifts
            </span>
          </div>
        ))}
      </div>

      {/* ── Availability quick link ───────────────────────────────── */}
      <SectionHeading title="Availability" />
      <Link href="/waiter/me/availability" style={{ textDecoration: 'none' }}>
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              Manage My Availability
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {staff.marketplaceVisible ? '🟢 Visible in marketplace' : '⚫ Hidden from marketplace'}
            </div>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
        </div>
      </Link>

      {/* ── Account settings ────────────────────────────────────── */}
      <SectionHeading title="Account" />
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
        {[
          { icon: Camera,      label: 'Edit Photos & Profile', href: '/waiter/me/photos'  },
          { icon: Bell,        label: 'Notification Settings', href: '#'                   },
          { icon: CreditCard,  label: 'Payout Settings',       href: '#'                   },
          { icon: Shield,      label: 'Privacy & Marketplace', href: '/waiter/me/privacy'  },
        ].map(({ icon: Icon, label, href }, i, arr) => (
          <Link
            key={label}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.875rem 1.25rem',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <Icon size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {label}
            </span>
            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
          </Link>
        ))}
      </div>

      {/* Log out */}
      <button
        className="btn-ghost"
        style={{ width: '100%', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.25)' }}
        onClick={() => alert('Sign out (UI demo)')}
      >
        <LogOut size={16} style={{ color: 'var(--error)' }} />
        Log Out
      </button>
    </div>
  )
}
