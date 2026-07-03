'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MOCK_AVAILABILITY, DAY_NAMES } from '@/lib/mock-data'
import type { AvailabilitySlot } from '@/lib/types'

type AvailTab = 'recurring' | 'specific'

const TIME_OPTIONS = [
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
  '6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM',
  '12:00 AM','1:00 AM','2:00 AM','3:00 AM','4:00 AM',
]

const SPECIFIC_OVERRIDES = [
  { date: 'Fri 28 Jun', type: 'unavailable' as const, note: 'Family wedding' },
  { date: 'Mon 1 Jul',  type: 'available'   as const, note: 'Daytime only: 12PM–8PM' },
]

export default function AvailabilityPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AvailTab>('recurring')
  const [slots, setSlots] = useState<AvailabilitySlot[]>(MOCK_AVAILABILITY)

  function toggleDay(day: number) {
    setSlots(prev =>
      prev.map(s =>
        s.dayOfWeek === day
          ? { ...s, availabilityType: s.availabilityType === 'available' ? 'unavailable' : 'available' }
          : s
      )
    )
  }

  return (
    <div className="page-content">
      <PageHeader
        title="My Availability"
        subtitle="Visible to venues searching the marketplace"
        onBack={() => router.push('/waiter/me')}
      />

      {/* Sub-tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', marginBottom: '1.25rem' }}>
        {(['recurring', 'specific'] as AvailTab[]).map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--amber)' : '2px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer',
                color: isActive ? 'var(--amber)' : 'var(--text-secondary)',
              }}
            >
              {tab === 'recurring' ? 'Recurring Weekly' : 'Specific Dates'}
            </button>
          )
        })}
      </div>

      {/* ── Recurring weekly ──────────────────────────────────────── */}
      {activeTab === 'recurring' && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Set your weekly schedule. Venues searching for staff will only see days you&apos;re available.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
            {slots.map((slot) => {
              const isAvailable = slot.availabilityType === 'available'
              return (
                <div
                  key={slot.dayOfWeek}
                  className="card"
                  style={{
                    padding: '0.875rem 1rem',
                    borderLeft: `3px solid ${isAvailable ? 'var(--success)' : 'var(--border-default)'}`,
                    opacity: isAvailable ? 1 : 0.6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: isAvailable ? '0.75rem' : 0 }}>
                    {/* Toggle */}
                    <button
                      onClick={() => toggleDay(slot.dayOfWeek)}
                      style={{
                        width: 44, height: 24, borderRadius: 12,
                        background: isAvailable ? 'var(--success)' : 'var(--border-default)',
                        border: 'none', cursor: 'pointer', position: 'relative',
                        transition: 'background 0.2s', flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 18, height: 18, borderRadius: '50%', background: '#fff',
                          position: 'absolute', top: 3,
                          left: isAvailable ? 23 : 3,
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    </button>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                      {DAY_NAMES[slot.dayOfWeek]}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: isAvailable ? 'var(--success)' : 'var(--text-tertiary)', fontWeight: 500 }}>
                      {isAvailable ? 'Available' : 'Off'}
                    </span>
                  </div>

                  {isAvailable && (
                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <label className="input-label" style={{ fontSize: '0.65rem' }}>From</label>
                        <select className="input" defaultValue={slot.availableFrom} style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                          {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div style={{ paddingTop: '1.25rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>→</div>
                      <div style={{ flex: 1 }}>
                        <label className="input-label" style={{ fontSize: '0.65rem' }}>Until</label>
                        <select className="input" defaultValue={slot.availableUntil} style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                          {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={() => alert('Availability saved! (UI demo)')}
          >
            Save Weekly Schedule
          </button>
        </div>
      )}

      {/* ── Specific dates ────────────────────────────────────────── */}
      {activeTab === 'specific' && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Override your weekly schedule for specific dates — holidays, events, or one-off availability.
          </p>

          <button
            className="btn-ghost"
            style={{ width: '100%', marginBottom: '1rem', gap: '0.5rem' }}
            onClick={() => alert('Add date override (UI demo)')}
          >
            <Plus size={16} />
            Add Date Override
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {SPECIFIC_OVERRIDES.map((override, i) => (
              <div
                key={i}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderLeft: `3px solid ${override.type === 'unavailable' ? 'var(--error)' : 'var(--success)'}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {override.date}
                    </span>
                    <span
                      className={`badge-pill ${override.type === 'unavailable' ? 'badge-urgent' : 'badge-active'}`}
                      style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}
                    >
                      {override.type === 'unavailable' ? '🚫 Off' : '✅ Available'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {override.note}
                  </div>
                </div>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                  onClick={() => alert('Delete override (UI demo)')}
                >
                  <Trash2 size={16} style={{ color: 'var(--text-tertiary)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
