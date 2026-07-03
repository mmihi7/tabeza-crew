'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { MOCK_SHIFT_HISTORY } from '@/lib/mock-data'
import { ShiftHistoryList } from '@/components/history/ShiftHistoryList'

// Month selector — static for UI demo, wired to API when backend is ready
const MONTHS = ['July 2026', 'June 2026', 'May 2026', 'April 2026']

export default function HistoryPage() {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[1])

  const shifts = MOCK_SHIFT_HISTORY

  const totalShifts  = shifts.length
  const totalTips    = shifts.reduce((s, sh) => s + sh.tipsEarned, 0)
  const totalOrders  = shifts.reduce((s, sh) => s + sh.ordersApproved, 0)
  const avgRating    = shifts.length
    ? (shifts.reduce((s, sh) => s + sh.rating, 0) / shifts.length).toFixed(1)
    : '—'

  return (
    <div className="page-content">

      {/* ── Page header ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h1 className="text-page-title">History</h1>
          <p className="text-subtitle" style={{ marginTop: '0.1rem' }}>Your shift record</p>
        </div>

        {/* Month picker */}
        <div style={{ position: 'relative' }}>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{
              appearance: 'none',
              background: 'var(--background-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: '0.5rem',
              padding: '0.375rem 2rem 0.375rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown
            size={13}
            style={{
              position: 'absolute', right: '0.5rem', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* ── Performance snapshot ──────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { label: 'Shifts',   value: String(totalShifts),                         amber: false },
          { label: 'Orders',   value: String(totalOrders),                          amber: false },
          { label: 'Tips',     value: `${(totalTips / 1000).toFixed(1)}k`,          amber: true  },
          { label: 'Avg ⭐',   value: String(avgRating),                            amber: false },
        ].map(({ label, value, amber }) => (
          <div
            key={label}
            style={{
              textAlign: 'center',
              padding: '0.75rem 0.375rem',
              background: amber ? 'var(--amber-pale)' : 'var(--background-secondary)',
              border: `1px solid ${amber ? 'rgba(245,158,11,0.2)' : 'var(--border-default)'}`,
              borderRadius: '0.75rem',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Motivation prompt ─────────────────────────────────────── */}
      {totalShifts > 0 && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--background-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: '0.75rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>
            {Number(avgRating) >= 4.8 ? '🔥' : Number(avgRating) >= 4.5 ? '💪' : '📈'}
          </span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {Number(avgRating) >= 4.8
                ? 'Outstanding month'
                : Number(avgRating) >= 4.5
                  ? 'Solid performance'
                  : 'Room to grow'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              {Number(avgRating) >= 4.8
                ? `${avgRating}★ average — you\'re in the top tier. Keep it up.`
                : Number(avgRating) >= 4.5
                  ? `${avgRating}★ average — one more push gets you Gold Waiter.`
                  : `${avgRating}★ average — focus on getting more customer likes this month.`}
            </div>
          </div>
        </div>
      )}

      {/* ── Shift list ────────────────────────────────────────────── */}
      <ShiftHistoryList shifts={shifts} />

    </div>
  )
}
