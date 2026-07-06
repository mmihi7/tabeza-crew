'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, CheckCircle2 } from 'lucide-react'

export default function PayoutPage() {
  const router = useRouter()

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: '0.5rem',
            background: 'var(--background-secondary)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Payout Settings
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            Manage how you receive your earnings
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '1.125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: 'var(--amber-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={18} style={{ color: 'var(--amber)' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>M-Pesa payout</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coming soon — your payouts will be routed here</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
          Earnings are tracked in your Tabeza account
        </div>
      </div>
    </div>
  )
}
