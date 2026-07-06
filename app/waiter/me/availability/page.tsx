'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { MOCK_AVAILABILITY, DAY_NAMES } from '@/lib/demo-data'
import type { AvailabilitySlot } from '@/lib/types'

type AvailTab = 'recurring' | 'specific'

const TIME_OPTIONS = [
  '00:00', '01:00', '02:00', '03:00', '06:00', '08:00', '09:00', '10:00',
  '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00', '23:00', '23:59',
]

function fmt12(t: string): string {
  const [hh, mm] = t.split(':').map(Number)
  const period = hh < 12 ? 'AM' : 'PM'
  const h = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh
  return `${h}:${String(mm).padStart(2, '0')} ${period}`
}

interface Override {
  id: string
  date: string
  type: 'available' | 'unavailable'
  from?: string
  until?: string
  note?: string
}

export default function AvailabilityPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AvailTab>('recurring')
  const [slots, setSlots]         = useState<AvailabilitySlot[]>(MOCK_AVAILABILITY)
  const [saved, setSaved]         = useState(false)
  const [overrides, setOverrides] = useState<Override[]>([
    {
      id: 'ov-1',
      date: '2026-06-28',
      type: 'unavailable',
      note: 'Family wedding',
    },
    {
      id: 'ov-2',
      date: '2026-07-01',
      type: 'available',
      from: '12:00',
      until: '20:00',
      note: 'Daytime shift only',
    },
  ])

  function toggleDay(dayOfWeek: number) {
    setSlots(prev =>
      prev.map(s =>
        s.dayOfWeek === dayOfWeek
          ? { ...s, availabilityType: s.availabilityType === 'available' ? 'unavailable' : 'available' }
          : s
      )
    )
  }

  function updateTime(dayOfWeek: number, field: 'availableFrom' | 'availableUntil', value: string) {
    setSlots(prev =>
      prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s)
    )
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function deleteOverride(id: string) {
    setOverrides(prev => prev.filter(o => o.id !== id))
  }

  function addOverride() {
    alert('Date override picker — coming soon (UI demo)')
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
            My Availability
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            Visible to venues searching the marketplace
          </p>
        </div>
      </div>

      {/* Sub-tab nav */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-default)',
          marginBottom: '1.25rem',
        }}
      >
        {(['recurring', 'specific'] as AvailTab[]).map(tab => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--amber)' : '2px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer',
                color: isActive ? 'var(--amber)' : 'var(--text-secondary)',
                transition: 'color 0.15s',
              }}
            >
              {tab === 'recurring' ? 'Recurring Weekly' : 'Specific Dates'}
            </button>
          )
        })}
      </div>

      {/* Recurring weekly */}
      {activeTab === 'recurring' && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Set your default weekly availability. Venues will only contact you for times you mark as available.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {slots.map(slot => {
              const isAvail = slot.availabilityType === 'available'
              return (
                <div
                  key={slot.dayOfWeek}
                  className="card"
                  style={{
                    padding: '0.875rem 1rem',
                    borderLeft: `3px solid ${isAvail ? 'var(--success)' : 'var(--border-default)'}`,
                    opacity: isAvail ? 1 : 0.6,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {/* Day row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isAvail ? '0.75rem' : 0 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {DAY_NAMES[slot.dayOfWeek]}
                    </span>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleDay(slot.dayOfWeek)}
                      style={{
                        width: 44, height: 24, borderRadius: '12px',
                        background: isAvail ? 'var(--success)' : 'var(--background-tertiary)',
                        border: `1px solid ${isAvail ? 'var(--success)' : 'var(--border-default)'}`,
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 2, left: isAvail ? 22 : 2,
                          width: 18, height: 18, borderRadius: '50%',
                          background: '#fff',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Time pickers (only when available) */}
                  {isAvail && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                      <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>
                          From
                        </label>
                        <select
                          className="input"
                          value={slot.availableFrom}
                          onChange={e => updateTime(slot.dayOfWeek, 'availableFrom', e.target.value)}
                          style={{ padding: '0.4rem 0.625rem', fontSize: '0.8rem' }}
                        >
                          {TIME_OPTIONS.map(t => (
                            <option key={t} value={t}>{fmt12(t)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>
                          Until
                        </label>
                        <select
                          className="input"
                          value={slot.availableUntil}
                          onChange={e => updateTime(slot.dayOfWeek, 'availableUntil', e.target.value)}
                          style={{ padding: '0.4rem 0.625rem', fontSize: '0.8rem' }}
                        >
                          {TIME_OPTIONS.map(t => (
                            <option key={t} value={t}>{fmt12(t)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button className="btn-primary" style={{ width: '100%' }} onClick={handleSave}>
            {saved ? '✓ Schedule Saved' : 'Save Weekly Schedule'}
          </button>
        </div>
      )}

      {/* Specific date overrides */}
      {activeTab === 'specific' && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Override your weekly schedule for specific dates — holidays, bookings, or special availability.
          </p>

          <button
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', gap: '0.375rem' }}
            onClick={addOverride}
          >
            <Plus size={16} />
            Add Date Override
          </button>

          {overrides.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2rem' }}>📅</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                No overrides set
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Your weekly schedule applies to all dates
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {overrides.map(ov => (
                <div
                  key={ov.id}
                  className="card"
                  style={{
                    padding: '0.875rem 1rem',
                    borderLeft: `3px solid ${ov.type === 'unavailable' ? 'var(--error)' : 'var(--success)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {new Date(ov.date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            background: ov.type === 'unavailable' ? 'rgba(239,68,68,0.10)' : 'rgba(16,185,129,0.10)',
                            color: ov.type === 'unavailable' ? 'var(--error)' : 'var(--success)',
                          }}
                        >
                          {ov.type === 'unavailable' ? '🚫 Unavailable' : `✅ Available${ov.from ? ` ${fmt12(ov.from)} – ${fmt12(ov.until!)}` : ''}`}
                        </span>
                      </div>
                      {ov.note && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                          &ldquo;{ov.note}&rdquo;
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteOverride(ov.id)}
                      style={{
                        width: 30, height: 30, borderRadius: '0.375rem',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      <Trash2 size={13} style={{ color: 'var(--error)' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
