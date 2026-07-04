'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Camera, ChevronRight, Bell, CreditCard, Shield,
  LogOut, Star, MapPin, Images, ExternalLink,
} from 'lucide-react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { MOCK_STAFF, formatCurrency, getBadgeLabel, getDefaultAvatarStyle } from '@/lib/mock-data'
import { useAuth } from '@/contexts/AuthContext'

export default function MePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const staff = MOCK_STAFF

  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || staff.displayName

  const { background: avatarBg, initials } = getDefaultAvatarStyle(displayName)

  const venues = [
    { name: 'The Alchemist', shifts: 42 },
    { name: "J's Fresh Bar",  shifts: 18 },
    { name: 'Brew Bistro',    shifts:  9 },
  ]

  return (
    // Outer wrapper — no horizontal padding so the hero bleeds edge-to-edge
    <div style={{ minHeight: '100%', background: 'var(--background-primary)' }}>

      {/* ── HERO PANEL ── roughly 1/3 viewport height ─────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '33dvh',
          minHeight: 220,
          maxHeight: 320,
          overflow: 'hidden',
          background: staff.halfBodyPhotoUrl
            ? 'var(--background-tertiary)'
            : avatarBg,
        }}
      >
        {staff.halfBodyPhotoUrl ? (
          <img
            src={staff.halfBodyPhotoUrl}
            alt={displayName}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              display: 'block',
            }}
          />
        ) : (
          /* Gradient placeholder when no photo uploaded */
          <div
            style={{
              width: '100%', height: '100%',
              background: `linear-gradient(160deg, ${avatarBg} 0%, var(--background-tertiary) 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e',
              }}
            >
              {initials}
            </div>
          </div>
        )}

        {/* Dark gradient fade at bottom for legibility */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* Name + badge overlay at bottom of hero */}
        <div
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            padding: '1rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                {displayName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
                  {staff.performanceScore}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>·</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                  {staff.totalShifts} shifts
                </span>
              </div>
            </div>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(245,158,11,0.85)',
                backdropFilter: 'blur(4px)',
                borderRadius: '999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1a1a2e',
              }}
            >
              {getBadgeLabel(staff.badgeTier)}
            </span>
          </div>
        </div>

        {/* Top-right: edit photo button */}
        <Link
          href="/waiter/me/photos"
          style={{
            position: 'absolute', top: '0.875rem', right: '0.875rem',
            width: 36, height: 36, borderRadius: '0.5rem',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <Camera size={17} style={{ color: '#fff' }} />
        </Link>
      </div>

      {/* ── ACTION ROW ── sits between hero and content ─────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.625rem',
          padding: '0.875rem 1rem',
          background: 'var(--background-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Gallery link */}
        <Link
          href="/waiter/me/photos"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem',
            background: 'var(--background-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: '0.625rem',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          <Images size={16} style={{ color: 'var(--amber)' }} />
          Edit Gallery
        </Link>

        {/* Public profile link */}
        <Link
          href="#"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem',
            background: 'var(--amber-pale)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: '0.625rem',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--amber)',
          }}
        >
          <ExternalLink size={15} />
          Public Profile
        </Link>
      </div>

      {/* ── SCROLLABLE CONTENT ─────────────────────────────────────────────── */}
      <div style={{ padding: '1.25rem 1rem' }}>

        {/* ── Performance stats ──────────────────────────────────── */}
        <SectionHeading title="Performance" />
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem 1.5rem' }}>
            {[
              { label: 'Orders approved', value: staff.totalApprovedOrders.toLocaleString() },
              { label: 'Approval rate',   value: `${staff.approvalRate}%` },
              { label: 'Tips earned',     value: formatCurrency(staff.totalTipsEarned) },
              { label: 'Customer likes',  value: staff.totalLikes.toLocaleString() },
              { label: 'Points',          value: `${staff.totalPoints.toLocaleString()} pts` },
              { label: 'Platform rank',   value: 'Top 8%' },
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

        {/* ── Venues worked ──────────────────────────────────────── */}
        <SectionHeading title="Venues Worked" />
        <div className="card" style={{ marginBottom: '1rem', padding: '0.875rem 1.25rem' }}>
          {venues.map((v, i) => (
            <div
              key={v.name}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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

        {/* ── Availability ───────────────────────────────────────── */}
        <SectionHeading title="Availability" />
        <Link href="/waiter/me/availability" style={{ textDecoration: 'none' }}>
          <div
            className="card"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '1rem', cursor: 'pointer',
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

        {/* ── Account settings ───────────────────────────────────── */}
        <SectionHeading title="Account" />
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
          {[
            { icon: Camera,     label: 'Edit Photos & Profile', href: '/waiter/me/photos'   },
            { icon: Bell,       label: 'Notification Settings', href: '#'                    },
            { icon: CreditCard, label: 'Payout Settings',       href: '#'                    },
            { icon: Shield,     label: 'Privacy & Marketplace', href: '/waiter/me/privacy'   },
          ].map(({ icon: Icon, label, href }, i, arr) => (
            <Link
              key={label}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1.25rem',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                textDecoration: 'none',
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
          style={{ width: '100%', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.25)', marginBottom: '1rem' }}
          onClick={async () => { await signOut(); router.replace('/auth/login') }}
        >
          <LogOut size={16} style={{ color: 'var(--error)' }} />
          Log Out
        </button>

      </div>
    </div>
  )
}
