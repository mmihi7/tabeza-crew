'use client'

import { useState } from 'react'
import { ShiftHistoryList } from '@/components/history/ShiftHistoryList'
import { TipHistoryList } from '@/components/history/TipHistoryList'
import { OrderHistoryList } from '@/components/history/OrderHistoryList'
import { MOCK_SHIFT_HISTORY, MOCK_TIPS, MOCK_ORDERS } from '@/lib/mock-data'

type HistoryTab = 'shifts' | 'tips' | 'orders'

const MONTHLY_TOTALS = {
  shifts: MOCK_SHIFT_HISTORY.length,
  tipsEarned: MOCK_TIPS.reduce((sum, t) => sum + t.amount, 0),
  ordersApproved: MOCK_ORDERS.filter(o => o.status === 'approved').length,
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('shifts')

  const tabs: { id: HistoryTab; label: string }[] = [
    { id: 'shifts',  label: 'Shifts'  },
    { id: 'tips',    label: 'Tips'    },
    { id: 'orders',  label: 'Orders'  },
  ]

  return (
    <div className="page-content">
      {/* Page header */}
      <div style={{ marginBottom: '0.25rem' }}>
        <h1 className="text-page-title">History</h1>
        <p className="text-subtitle">June 2026</p>
      </div>

      {/* Monthly summary strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.5rem',
          margin: '1rem 0',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '0.75rem 0.5rem',
            background: 'var(--background-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: '0.75rem',
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {MONTHLY_TOTALS.shifts}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 2 }}>Shifts</div>
        </div>
        <div
          style={{
            textAlign: 'center',
            padding: '0.75rem 0.5rem',
            background: 'var(--amber-pale)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '0.75rem',
          }}
        >
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {MONTHLY_TOTALS.tipsEarned.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 2 }}>Tips (KES)</div>
        </div>
        <div
          style={{
            textAlign: 'center',
            padding: '0.75rem 0.5rem',
            background: 'var(--background-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: '0.75rem',
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {MONTHLY_TOTALS.ordersApproved}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 2 }}>Approved</div>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-default)',
          marginBottom: '1.25rem',
        }}
      >
        {tabs.map(({ id, label }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
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
              {label}
            </button>
          )
        })}
      </div>

      {/* Sub-tab content */}
      {activeTab === 'shifts'  && <ShiftHistoryList shifts={MOCK_SHIFT_HISTORY} />}
      {activeTab === 'tips'    && <TipHistoryList tips={MOCK_TIPS} totalMonth={MONTHLY_TOTALS.tipsEarned} />}
      {activeTab === 'orders'  && <OrderHistoryList orders={MOCK_ORDERS} />}
    </div>
  )
}
