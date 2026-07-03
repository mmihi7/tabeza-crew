'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionHeading } from '@/components/shared/SectionHeading'

const LOCATIONS = ['Westlands', 'Kilimani', 'CBD', 'Karen', 'Lavington', 'Parklands', 'Runda']

interface ToggleRowProps {
  label: string
  sublabel?: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

function ToggleRow({ label, sublabel, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--border-subtle)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>{sublabel}</div>
        )}
      </div>
      <button
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, flexShrink: 0,
          background: checked ? 'var(--success)' : 'var(--border-default)',
          border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3,
            left: checked ? 23 : 3,
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  )
}

export default function PrivacyPage() {
  const router = useRouter()

  const [marketplaceVisible, setMarketplaceVisible] = useState(true)
  const [showHalfBody, setShowHalfBody]             = useState(true)
  const [showFullBody, setShowFullBody]             = useState(true)
  const [showStats, setShowStats]                   = useState(true)
  const [showVenues, setShowVenues]                 = useState(true)
  const [selectedLocations, setSelectedLocations]   = useState(['Westlands', 'Kilimani'])

  function toggleLocation(loc: string) {
    setSelectedLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    )
  }

  return (
    <div className="page-content">
      <PageHeader
        title="Privacy & Marketplace"
        subtitle="Control who can find and hire you"
        onBack={() => router.push('/waiter/me')}
      />

      {/* Marketplace visibility */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeading title="Marketplace Visibility" />

        {/* Big toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem',
            borderRadius: '0.5rem',
            background: marketplaceVisible ? 'var(--amber-pale)' : 'var(--background-tertiary)',
            border: `1px solid ${marketplaceVisible ? 'rgba(245,158,11,0.25)' : 'var(--border-default)'}`,
            marginBottom: '0.875rem',
            cursor: 'pointer',
          }}
          onClick={() => setMarketplaceVisible(v => !v)}
        >
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {marketplaceVisible ? '🟢 Visible' : '⚫ Hidden'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {marketplaceVisible
                ? 'Venues can find and hire you'
                : 'Only venues you\'ve worked with can see you'}
            </div>
          </div>
          <div
            style={{
              width: 52, height: 28, borderRadius: 14,
              background: marketplaceVisible ? 'var(--amber)' : 'var(--border-default)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: marketplaceVisible ? 27 : 3,
                transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Profile visibility options */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeading
          title="Profile Visibility"
          description="Choose what venues see on your profile. Face photo always shown."
        />
        <div>
          <ToggleRow
            label="Face photo"
            sublabel="Always shown — required for marketplace"
            checked={true}
            onChange={() => {}}
            disabled
          />
          <ToggleRow
            label="Half body photo"
            sublabel="Shown on profile cards"
            checked={showHalfBody}
            onChange={setShowHalfBody}
          />
          <ToggleRow
            label="Full body photo"
            sublabel="Shown in expanded gallery"
            checked={showFullBody}
            onChange={setShowFullBody}
          />
          <ToggleRow
            label="Performance stats"
            sublabel="Orders, tips, approval rate"
            checked={showStats}
            onChange={setShowStats}
          />
          <ToggleRow
            label="Venues worked"
            sublabel="Your shift history by venue"
            checked={showVenues}
            onChange={setShowVenues}
          />
        </div>
      </div>

      {/* Preferred work locations */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <SectionHeading
          title="Preferred Work Locations"
          description="Helps venues near you find you first"
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {LOCATIONS.map((loc) => {
            const selected = selectedLocations.includes(loc)
            return (
              <button
                key={loc}
                onClick={() => toggleLocation(loc)}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '999px',
                  border: `1px solid ${selected ? 'var(--amber)' : 'var(--border-default)'}`,
                  background: selected ? 'var(--amber-pale)' : 'var(--background-secondary)',
                  color: selected ? 'var(--amber)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: selected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {selected ? '✓ ' : ''}{loc}
              </button>
            )
          })}
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>
          {selectedLocations.length} location{selectedLocations.length !== 1 ? 's' : ''} selected
        </p>
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%' }}
        onClick={() => { alert('Privacy settings saved! (UI demo)'); router.push('/waiter/me') }}
      >
        Save Settings
      </button>
    </div>
  )
}
