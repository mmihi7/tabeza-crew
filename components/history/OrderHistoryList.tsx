import { CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import type { OrderRecord } from '@/lib/types'
import { formatCurrency } from '@/lib/demo-data'

interface OrderHistoryListProps {
  orders: OrderRecord[]
}

export function OrderHistoryList({ orders }: OrderHistoryListProps) {
  const approved = orders.filter(o => o.status === 'approved')
  const declined = orders.filter(o => o.status === 'declined')
  const approvalRate = orders.length > 0
    ? Math.round((approved.length / orders.length) * 100)
    : 0

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '2rem' }}>📋</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          No orders this month
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Approval rate bar */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>✅ {approved.length} approved</span>
            {'  '}
            <span style={{ color: 'var(--error)', fontWeight: 600 }}>❌ {declined.length} declined</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <TrendingUp size={13} style={{ color: approvalRate >= 90 ? 'var(--success)' : 'var(--warning)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {approvalRate}%
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div
          style={{
            height: 6, background: 'var(--background-tertiary)',
            borderRadius: 3, overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${approvalRate}%`,
              background: approvalRate >= 90 ? 'var(--success)' : 'var(--warning)',
              borderRadius: 3,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>
          Approval rate
        </div>
      </div>

      {/* Order list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {orders.map((order) => {
          const isApproved = order.status === 'approved'
          return (
            <div
              key={order.id}
              className="card"
              style={{
                padding: '0.875rem 1rem',
                borderLeft: `3px solid ${isApproved ? 'var(--success)' : 'var(--error)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                {/* Status icon */}
                {isApproved
                  ? <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }} />
                  : <XCircle   size={18} style={{ color: 'var(--error)',   flexShrink: 0, marginTop: 1 }} />
                }

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {order.items}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Table {order.tableNumber}</span>
                    <span>·</span>
                    <span>{order.timestamp}</span>
                    <span>·</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatCurrency(order.amount)}
                    </span>
                    {isApproved && (
                      <>
                        <span>·</span>
                        <span style={{ color: 'var(--amber)', fontWeight: 600 }}>
                          +{order.points} pts
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
