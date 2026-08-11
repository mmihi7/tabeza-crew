'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, XCircle, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'

export default function TabDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const tabId = params.id as string

  const [tab, setTab] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadTabData = useCallback(async () => {
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

      const ordersRes = await fetch(`/api/tabs/${tabId}/orders`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const ordersData = await ordersRes.json()
      setOrders(ordersData.orders || ordersData || [])
    } catch (err) {
      console.error('Error loading tab:', err)
    } finally {
      setLoading(false)
    }
  }, [tabId])

  useEffect(() => {
    if (!tabId || !user) return
    loadTabData()
  }, [tabId, user, loadTabData])

  if (loading) {
    return (
      <div className="page-content" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '40dvh', background: 'var(--ink)',
        userSelect: 'none', WebkitTouchCallout: 'none',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid var(--border)', borderTopColor: 'var(--amber)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!tab) {
    return (
      <div className="page-content" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '40dvh', background: 'var(--ink)',
        userSelect: 'none', WebkitTouchCallout: 'none',
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center' }}>
          <p>Tab not found</p>
          <button onClick={() => router.back()} style={{ marginTop: '0.75rem', color: 'var(--amber)', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>
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
    <div style={{
      minHeight: '100dvh', background: 'var(--ink)',
      userSelect: 'none', WebkitTouchCallout: 'none',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--ink-2)', borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1rem', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => router.back()} style={{
            width: 36, height: 36, borderRadius: '0.5rem',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ArrowLeft size={18} style={{ color: 'var(--cream)' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cream)' }}>
              {tab.displayName}
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.1rem' }}>
              Tab #{tab.tabNumber}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1rem' }}>
        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem',
          marginBottom: '1.25rem',
        }}>
          {[
            { label: 'Status', value: tab.status || '—' },
            { label: 'Orders', value: String(orders.length) },
            { label: 'Spent', value: formatCurrency(totalSpend) },
          ].map(({ label, value }) => (
            <div key={label} style={{
              textAlign: 'center', padding: '0.75rem 0.375rem',
              background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--cream)', lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Balance */}
        <div style={{
          padding: '0.875rem 1rem', marginBottom: '1.25rem',
          background: 'rgba(255,79,0,0.08)', border: '1px solid rgba(255,79,0,0.2)',
          borderRadius: '0.75rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Current Balance
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--cream)' }}>
            {formatCurrency(tab.balance)}
          </div>
        </div>

        {/* Orders header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cream)' }}>Order History</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{orders.length} total</span>
        </div>

        {orders.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '2rem 1rem',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
            borderRadius: '0.75rem',
          }}>
            <Package size={32} style={{ color: 'var(--muted)', margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)' }}>No orders yet</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {orders.map((order: any) => {
              const isConfirmed = order.status === 'confirmed'
              return (
                <div key={order.id} style={{
                  padding: '0.875rem 1rem',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  borderLeft: `3px solid ${isConfirmed ? 'var(--success)' : order.status === 'cancelled' ? 'var(--error)' : 'var(--amber)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    {isConfirmed
                      ? <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                      : order.status === 'cancelled'
                        ? <XCircle size={16} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }} />
                        : <Clock size={16} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 2 }} />
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '0.2rem' }}>
                        {order.items || `Order at ${new Date(order.createdAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.72rem', color: 'var(--muted)' }}>
                        <span>{new Date(order.createdAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>·</span>
                        <span style={{ fontWeight: 600, color: 'var(--cream)' }}>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Back button */}
        <button onClick={() => router.push('/waiter/tabs')} style={{
          width: '100%', marginTop: '1.5rem', padding: '0.75rem',
          background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
          borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight: 600,
          color: 'var(--muted)', cursor: 'pointer',
        }}>
          Back to My Tabs
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
