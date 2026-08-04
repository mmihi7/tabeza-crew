'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, ChevronRight, Clock, CheckCircle,
  XCircle, DollarSign, MessageSquare, Package,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import { AddOrderModal } from '@/components/tabs/AddOrderModal'
import type { OrderRecord } from '@/lib/types'

interface BarProduct {
  id: string
  bar_id: string
  product_id: string
  sale_price: number
  active: boolean
  product?: {
    id: string
    name: string
    category: string
  }
}

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
}

export default function TabDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const tabId = params.id as string

  const [tab, setTab] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addOrderOpen, setAddOrderOpen] = useState(false)
  const [submittingOrder, setSubmittingOrder] = useState(false)

  useEffect(() => {
    if (!tabId || !user) return
    loadTabData()
  }, [tabId, user])

  async function loadTabData() {
    try {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) return

      const res = await fetch(`/api/tabs/${tabId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await res.json()
      const tabData = data.tab ?? data

      setTab(tabData)

      if (tabData?.bar_id) {
        const menuRes = await fetch(`/api/menu/${tabData.bar_id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const menuData = await menuRes.json()

        const products: MenuItem[] = ((menuData.products || menuData) as any[])
          .filter((p: any) => p.active !== false)
          .map((p: any) => ({
            id: p.id || p.product_id,
            name: p.product?.name || p.name || 'Item',
            price: p.sale_price || p.price || 0,
            category: p.product?.category || p.category || 'Other',
          }))
        setMenuItems(products)

        const ordersRes = await fetch(`/api/tabs/${tabId}/orders`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders || ordersData || [])
      }
    } catch (err) {
      console.error('Error loading tab:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleOrderSent(items: string, amount: number) {
    setSubmittingOrder(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) return

      const res = await fetch(`/api/tabs/${tabId}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          items: items,
          total: amount,
          initiated_by: 'staff',
        }),
      })

      if (res.ok) {
        const newOrder = await res.json()
        const created = newOrder.order || newOrder
        setOrders((prev: any[]) => [created, ...prev])
        setAddOrderOpen(false)
      }
    } catch (err) {
      console.error('Error sending order:', err)
    } finally {
      setSubmittingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40dvh' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Loading tab...</div>
      </div>
    )
  }

  if (!tab) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40dvh' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          <p>Tab not found</p>
          <button
            onClick={() => router.back()}
            style={{ marginTop: '0.75rem', color: 'var(--amber)', fontSize: '0.8rem' }}
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  const totalSpend = orders
    .filter((o: any) => o.status === 'confirmed')
    .reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0)

  return (
    <>
      <div className="page-content">
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
              {tab.display_name || `Tab #${tab.tab_number || ''}`}
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              {tab.bar?.name || ''}
            </p>
          </div>
        </div>

        <div className="card-amber" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--amber)', marginBottom: '0.25rem' }}>
                Status
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {tab.status}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--amber)', marginBottom: '0.25rem' }}>
                Orders
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {orders.length}
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
        </div>

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
            onClick={() => router.push(`/waiter`)}
          >
            <MessageSquare size={20} />
            <span style={{ fontSize: '0.8rem' }}>Back to Home</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div className="text-section-heading">Orders</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            {orders.length} total
          </span>
        </div>

        {orders.length === 0 ? (
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
            {orders.map((order: any) => {
              const isConfirmed = order.status === 'confirmed'
              return (
                <div
                  key={order.id}
                  className="card"
                  style={{
                    padding: '0.875rem 1rem',
                    borderLeft: `3px solid ${isConfirmed ? 'var(--success)' : order.status === 'cancelled' ? 'var(--error)' : 'var(--amber)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    {isConfirmed
                      ? <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                      : order.status === 'cancelled'
                        ? <XCircle size={16} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }} />
                        : <Clock   size={16} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 2 }} />
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                        {order.items || `Order at ${new Date(order.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>
                          {new Date(order.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>·</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatCurrency(parseFloat(order.total) || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {addOrderOpen && (
        <AddOrderModal
          tab={tab}
          menuItems={menuItems}
          onSend={handleOrderSent}
          onClose={() => setAddOrderOpen(false)}
        />
      )}
    </>
  )
}
