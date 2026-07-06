'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { MOCK_STAFF } from '@/lib/demo-data'

const NAIROBI_LOCATIONS = [
  'Westlands', 'Kilimani', 'CBD', 'Karen', 'Lavington',
  'Parklands', 'Hurlingham', 'Upper Hill', 'Runda', 'Gigiri',
]

const VISIBILITY_OPTIONS = [
  { id: 'stats',    label: 'Show performance stats',   desc: 'Orders, approval rate, tips earned' },
  { id: 'venues',   label: 'Show venues worked',        desc: 'Shifts history per venue shown on profile' },
  { id: 'half',     label: 'Show half-body photo',      desc: 'Shown on marketplace profile card' },
  { id: 'full',     label: 'Show full-body photo',      desc: 'Shown in expanded profile gallery' },
]

export default function PrivacyPage() {
  const router = useRouter()
  const staff  = MOCK_STAFF

  const [marketplaceVisible, setMarketplaceVisible] = useState(staff.marketplaceVisible)
  const [visibilityFlags, setVisibilityFlags] = useState<Record<string, boolean>>({
    stats:  true,
    venues: true,
    half:   true,
    full:   true,
  })
  const [locations, setLocations] = useState<string[]>(['Westlands', 'Kilimani'])
  const [saved, setSaved] = useState(false)

  function toggleFlag(id: string) {
    setVisibilityFlags(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleLocation(loc: string) {
    setLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    )
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: '0.5rem',
            background: 'var(--background-secondary)',
            border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Privacy & Marketplace
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            Control what venues see
          </p>
        </div>
      </div>

      {/* Marketplace visibility master toggle */}
      <div className="text-section-heading" style={{ marginBottom: '0.5rem' }}>
        Marketplace Visibility
      </div>
      <div
        className="card"
        style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            {marketplaceVisible ? '🟢 Visible to venues' : '⚫ Hidden from marketplace'}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {marketplaceVisible
              ? 'Your profile appears in venue searches. You\'ll receive hire requests.'
              : 'Only venues you\'ve worked with before can see you.'}
          </p>
        </div>
        <button
          onClick={() => setMarketplaceVisible(v => !v)}
          style={{
            width: 50, height: 28, borderRadius: '14px',
            background: marketplaceVisible ? 'var(--success)' : 'var(--background-tertiary)',
            border: `1px solid ${marketplaceVisible ? 'var(--success)' : 'var(--border-default)'}`,
            position: 'relative',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 3, left: marketplaceVisible ? 24 : 3,
              width: 20, height: 20, borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </button>
      </div>

      {/* Profile visibility options */}
      <div className="text-section-heading" style={{ marginBottom: '0.5rem' }}>
        Profile Visibility
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
        Face photo is always shown when visible. Uncheck below to hide individual sections.
      </p>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
        {VISIBILITY_OPTIONS.map(({ id, label, desc }, i) => (
          <label
            key={id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.875rem 1.25rem',
              borderBottom: i < VISIBILITY_OPTIONS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={visibilityFlags[id]}
              onChange={() => toggleFlag(id)}
              style={{ width: 16, height: 16, accentColor: 'var(--amber)', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {label}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                {desc}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Preferred locations */}
      <div className="text-section-heading" style={{ marginBottom: '0.5rem' }}>
        Preferred Work Locations
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
        Helps venues nearby find you when filtering by area.
      </p>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {NAIROBI_LOCATIONS.map(loc => {
          const selected = locations.includes(loc)
          return (
            <button
              key={loc}
              onClick={() => toggleLocation(loc)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: selected ? 600 : 400,
                border: `1px solid ${selected ? 'var(--amber)' : 'var(--border-default)'}`,
                background: selected ? 'var(--amber-pale)' : 'var(--background-secondary)',
                color: selected ? 'var(--amber)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {selected ? '✓ ' : ''}{loc}
            </button>
          )
        })}
      </div>

      {/* Save */}
      <button className="btn-primary" style={{ width: '100%' }} onClick={handleSave}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
