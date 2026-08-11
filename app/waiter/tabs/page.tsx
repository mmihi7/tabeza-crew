'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useCountdown } from '@/hooks/useCountdown'
import { CheckoutModal } from '@/components/home/CheckoutModal'
import { formatCurrency } from '@/lib/utils'

const STORAGE_KEY = 'tabeza-shift-confirmed'

interface TabData {
  id: string
  tabId: string
  tabNumber: number
  displayName: string
  balance: number
  status: string
  orderCount: number
  barName: string
}

export default function AssignedTabsPage() {
  const router = useRouter()
  const { user, getSession } = useAuth()
  const [tabs, setTabs] = useState<TabData[]>([])
  const [shift, setShift] = useState<any>(null)
  const [shiftState, setShiftState] = useState<string>('active')
  const [loading, setLoading] = useState(true)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    loadData()
  }, [user?.id])

  async function loadData() {
    try {
      const session = getSession()
      const accessToken = session?.access_token
      if (!accessToken) { router.replace('/waiter'); return }

      const shiftRes = await fetch('/api/shifts', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const shiftData = await shiftRes.json()

      const activeShift = shiftData.activeShifts?.[0]
      if (!activeShift) {
        router.replace('/waiter')
        return
      }

      const confirmed = localStorage.getItem(`${STORAGE_KEY}-${activeShift.id}`)
      if (!confirmed) {
        router.replace('/waiter/checkin')
        return
      }

      setShift(activeShift)
      setShiftState(activeShift.status)

      const tabsRes = await fetch('/api/tabs', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const tabsData = await tabsRes.json()
      setTabs(tabsData.tabs || [])
    } catch {
      router.replace('/waiter')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!shift?.id) return
    const channel = supabase.channel(`crew-tabs-${shift.id}`)

    channel.on('postgres_changes' as any, {
      event: '*',
      schema: 'public',
      table: 'tab_assignments',
      filter: `crew_member_id=eq.${shift.crew_member_id || ''}`,
    }, () => loadData())

    channel.on('postgres_changes' as any, {
      event: '*',
      schema: 'public',
      table: 'tabs',
    }, () => loadData())

    channel.subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [shift?.id])

  useEffect(() => {
    if (!shift?.id) return
    const interval = setInterval(async () => {
      try {
        const session = getSession()
        const accessToken = session?.access_token
        if (!accessToken) return
        const res = await fetch('/api/shifts', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json()
        const active = data.activeShifts?.[0]
        if (!active) { router.replace('/waiter'); return }
        setShiftState(active.status)
        setShift(active)
      } catch {}
    }, 30000)
    return () => clearInterval(interval)
  }, [shift?.id])

  const shiftEndCountdown = useCountdown(shift?.shiftEnd)
  const isEndingSoon = shiftState === 'ending_soon'

  const totalOrders = tabs.reduce((s, t) => s + (t.orderCount || 0), 0)
  const totalAmount = tabs.reduce((s, t) => s + (t.balance || 0), 0)

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--ink)',
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

  return (
    <>
      <div style={{
        minHeight: '100dvh',
        background: 'var(--ink)',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--ink-2)',
          borderBottom: '1px solid var(--border)',
          padding: '0.75rem 1rem',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{
            maxWidth: 480, margin: '0 auto',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <button onClick={() => router.push('/waiter')} style={{
              width: 36, height: 36, borderRadius: '0.5rem',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}>
              <ArrowLeft size={18} style={{ color: 'var(--cream)' }} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)' }}>
                My Tabs
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.1rem' }}>
                {tabs.length} tab{tabs.length !== 1 ? 's' : ''} · {totalOrders} order{totalOrders !== 1 ? 's' : ''} · {formatCurrency(totalAmount)}
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.75rem', fontWeight: 700, color: isEndingSoon ? 'var(--warning)' : 'var(--success)',
              background: isEndingSoon ? 'rgba(252,211,77,0.1)' : 'rgba(134,239,172,0.1)',
              border: `1px solid ${isEndingSoon ? 'rgba(252,211,77,0.25)' : 'rgba(134,239,172,0.25)'}`,
              borderRadius: '0.5rem', padding: '0.35rem 0.6rem',
              whiteSpace: 'nowrap',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                backgroundColor: isEndingSoon ? 'var(--warning)' : 'var(--success)',
                animation: isEndingSoon ? 'none' : 'pulse 1.5s infinite',
              }} />
              {shiftEndCountdown.isPast ? 'Ended' : shiftEndCountdown.formatted}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '1rem' }}>
          {/* Stats strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            {[
              { label: 'Tabs', value: String(tabs.length) },
              { label: 'Orders', value: String(totalOrders) },
              { label: 'Balance', value: formatCurrency(totalAmount) },
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

          {/* Ending-soon warning */}
          {isEndingSoon && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', marginBottom: '1rem',
              background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.25)',
              borderRadius: '0.75rem',
            }}>
              <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cream)' }}>
                  Your shift ends in {shiftEndCountdown.isPast ? 'moments' : shiftEndCountdown.formatted}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                  {tabs.length} tab{tabs.length !== 1 ? 's' : ''} still open
                </div>
              </div>
            </div>
          )}

          {/* Tab cards */}
          {tabs.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem 1rem',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: '0.75rem',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.375rem' }}>
                No tabs assigned yet
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-2)', lineHeight: 1.5 }}>
                Customer tabs will appear here once assigned by the venue manager
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => router.push(`/waiter/tabs/${tab.tabId}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '1rem', textAlign: 'left', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                    borderRadius: '0.75rem', width: '100%',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '0.5rem',
                    background: 'rgba(255,79,0,0.12)', border: '1px solid rgba(255,79,0,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: '0.65rem', fontWeight: 700,
                    color: 'var(--amber)',
                  }}>
                    #{tab.tabNumber}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cream)' }}>
                      {tab.displayName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                      {formatCurrency(tab.balance)} · {tab.orderCount} order{tab.orderCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      background: tab.status === 'active' ? 'rgba(134,239,172,0.12)' : 'rgba(255,255,255,0.05)',
                      color: tab.status === 'active' ? 'var(--success)' : 'var(--muted)',
                      border: `1px solid ${tab.status === 'active' ? 'rgba(134,239,172,0.25)' : 'var(--border)'}`,
                      textTransform: 'capitalize',
                    }}>
                      {tab.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Checkout button */}
          <button
            onClick={() => setCheckoutOpen(true)}
            style={{
              width: '100%', marginTop: '1.5rem', padding: '0.875rem',
              background: isEndingSoon && tabs.length > 0 ? 'rgba(255,255,255,0.06)' : 'var(--amber)',
              border: isEndingSoon && tabs.length > 0 ? '1px solid var(--border)' : 'none',
              borderRadius: '0.75rem', fontSize: '0.9rem', fontWeight: 700,
              color: isEndingSoon && tabs.length > 0 ? 'var(--muted)' : 'var(--ink)',
              cursor: isEndingSoon && tabs.length > 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              opacity: isEndingSoon && tabs.length > 0 ? 0.6 : 1,
            }}
            disabled={isEndingSoon && tabs.length > 0}
          >
            {isEndingSoon && tabs.length > 0 ? (
              <>
                <AlertTriangle size={16} />
                Clear all tabs to check out
              </>
            ) : (
              <>
                <LogOut size={16} />
                Check Out
              </>
            )}
          </button>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal
          shiftSummary={{
            orders: totalOrders,
            tips: 0,
            points: 0,
            hoursWorked: shiftEndCountdown.isPast ? '0h' : '',
          }}
          onClose={() => setCheckoutOpen(false)}
          onConfirm={async () => {
            try {
              const session = getSession()
              const accessToken = session?.access_token
              if (!accessToken) return
              localStorage.removeItem(`${STORAGE_KEY}-${shift?.id}`)
              await supabase.auth.signOut()
              router.replace('/auth/login')
            } catch {}
          }}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
    </>
  )
}
