'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, ChevronRight, Clock, CheckCircle,
  XCircle, DollarSign, MessageSquare, Package,
} from 'lucide-react'
import { MOCK_ASSIGNED_TABS, formatCurrency } from '@/lib/demo-data'
import { AddOrderModal } from '@/components/tabs/AddOrderModal'
import type { OrderRecord } from '@/lib/types'

// Mock menu items for order creation
const MENU_ITEMS = [
  { id: 'p-001', name: 'Tusker Lager',    price: 350, category: 'Drinks' },
  { id: 'p-002', name: 'Guinness',        price: 420, category: 'Drinks' },
  { id: 'p-003', name: 'Amarula',         price: 650, category: 'Drinks' },
  { id: 'p-004', name: 'Heineken',        price: 380, category: 'Drinks' },
  { id: 'p-005', name: 'Nyama Choma',     price: 850, category: 'Food'   },
  { id: 'p-006', name: 'Fries',           price: 350, category: 'Food'   },
  { id: 'p-007', name: 'Nachos',          price: 480, category: 'Food'   },
  { id: 'p-008', name: 'Chicken Wings',   price: 650, category: 'Food'   },
]

// Extend orders with tab context for this demo
const TAB_ORDERS: Record<string, OrderRecord[]> = {
  'tab-001': [
    { id: 'ord-001', items: '2x Tusker, 1x Nyama Choma', tableNumber: 5, status: 'approved', amount: 1550, points: 5, timestamp: '9:14 PM' },
    { id: 'ord-004', items: '1x Guinness, 1x Fries',     tableNumber: 5, status: 'approved', amount: 770,  points: 5, timestamp: '8:45 PM' },
  ],
  'tab-002': [
    { id: 'ord-005', items: '2x Heineken',                tableNumber: 8, status: 'approved', amount: 760, points: 5,  timestamp: '9:00 PM' },
  ],
  'tab-003': [
    { id: 'ord-006', items: '3x Heineken, 1x Nachos',    tableNumber: 12, status: 'approved', amount: 1620, points: 5, timestamp: '8:30 PM' },
    { id: 'ord-007', items: '2x Tusker, 2x Nyama Choma', tableNumber: 12, status: 'approved', amount: 2400, points: 5, timestamp: '7:50 PM' },
    { id: 'ord-008', items: '1x Amarula, 1x Chicken Wings', tableNumber: 12, status: 'approved', amount: 1300, points: 5, timestamp: '7:20 PM' },
  ],
}

export default function TabDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tabId = params.id as string

  const tab = MOCK_ASSIGNED_TABS.find(t => t.id === tabId)
  const orders = TAB_ORDERS[tabId] ?? []

  const [addOrderOpen, setAddOrderOpen] = useState(false)
  const [localOrders, setLocalOrders] = useState<OrderRecord[]>(orders)

  if (!tab) {
    return (
      <div className="page-content">
        <button
          className="btn-ghost"
          style={{ marginBottom: '1rem', gap: '0.375rem' }}
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="empty-state">
          <div style={{ fontSize: '2rem' }}>🔍</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Tab not found
          </div>
        </div>
      </div>
    )
  }

  const totalSpend = localOrders
    .filter(o => o.status === 'approved')
    .reduce((sum, o) => sum + o.amount, 0)

  function handleOrderSent(items: string, amount: number) {
    const newOrder: OrderRecord = {
      id: `ord-new-${Date.now()}`,
      items,
      tableNumber: tab!.tableNumber,
      status: 'approved', // optimistic for UI demo
      amount,
      points: 5,
      timestamp: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
    }
    setLocalOrders(prev => [newOrder, ...prev])
    setAddOrderOpen(false)
  }

  return (
    <>
      <div className="page-content">
        {/* Back header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
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
              Table {tab.tableNumber}
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              {tab.customerName}
            </p>
          </div>
        </div>

        {/* Tab summary card */}
        <div className="card-amber" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--amber)', marginBottom: '0.25rem' }}>
                Balance
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatCurrency(tab.currentBalance)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--amber)', marginBottom: '0.25rem' }}>
                Rounds
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {tab.roundCount}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--amber)', marginBottom: '0.25rem' }}>
                Spent
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatCurrency(totalSpend)}
              </div>
            </div>
          </div>

          {/* Status badges */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
            {tab.hasPendingOrder && (
              <span className="badge-pill badge-pending">
                <Clock size={10} /> Pending approval
              </span>
            )}
            {tab.hasTip && (
              <span className="badge-pill badge-active">
                <DollarSign size={10} /> Tip received!
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.5rem' }}>
          <button
            className="btn-primary"
            style={{ padding: '0.75rem', flexDirection: 'column', gap: '0.375rem', height: 'auto' }}
            onClick={() => setAddOrderOpen(true)}
          >
            <Plus size={20} />
            <span style={{ fontSize: '0.8rem' }}>Add Order</span>
          </button>
          <button
            className="btn-ghost"
            style={{ padding: '0.75rem', flexDirection: 'column', gap: '0.375rem', height: 'auto' }}
            onClick={() => alert('Message customer — coming soon')}
          >
            <MessageSquare size={20} />
            <span style={{ fontSize: '0.8rem' }}>Message</span>
          </button>
        </div>

        {/* Order history */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div className="text-section-heading">Orders</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            {localOrders.length} total
          </span>
        </div>

        {localOrders.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <Package size={32} style={{ color: 'var(--text-tertiary)' }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              No orders yet
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Tap Add Order to create the first round
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {localOrders.map((order) => {
              const isApproved = order.status === 'approved'
              return (
                <div
                  key={order.id}
                  className="card"
                  style={{
                    padding: '0.875rem 1rem',
                    borderLeft: `3px solid ${isApproved ? 'var(--success)' : order.status === 'declined' ? 'var(--error)' : 'var(--amber)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    {isApproved
                      ? <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                      : order.status === 'declined'
                        ? <XCircle size={16} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }} />
                        : <Clock   size={16} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 2 }} />
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                        {order.items}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>{order.timestamp}</span>
                        <span>·</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatCurrency(order.amount)}
                        </span>
                        {isApproved && order.points > 0 && (
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
        )}

        {/* Transfer tab */}
        <button
          className="btn-ghost"
          style={{ width: '100%', color: 'var(--text-secondary)', gap: '0.375rem' }}
          onClick={() => alert('Transfer tab — select another on-shift waiter to hand this table to')}
        >
          <ChevronRight size={16} />
          Transfer Tab to Another Waiter
        </button>
      </div>

      {addOrderOpen && (
        <AddOrderModal
          tab={tab}
          menuItems={MENU_ITEMS}
          onSend={handleOrderSent}
          onClose={() => setAddOrderOpen(false)}
        />
      )}
    </>
  )
}
