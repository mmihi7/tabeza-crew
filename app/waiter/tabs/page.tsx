'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, AlertTriangle, Bell, Check } from 'lucide-react'
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
  const [alertModal, setAlertModal] = useState<any>(null)
  const [acknowledging, setAcknowledging] = useState(false)

  const loadData = useCallback(async () => {
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
  }, [getSession, router])

  useEffect(() => {
    if (!user?.id) return
    loadData()
  }, [user?.id, loadData])

  useEffect(() => {
    if (!shift?.id) return
    const channel = supabase.channel(`crew-tabs-${shift.id}`)

    channel.on('postgres_changes' as any, {
      event: '*',
      schema: 'public',
      table: 'tab_assignments',
      filter: `crew_member_id=eq.${shift.crewMemberId || ''}`,
    }, () => loadData())

    channel.on('postgres_changes' as any, {
      event: '*',
      schema: 'public',
      table: 'tabs',
    }, () => loadData())

    channel.subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [shift?.id, shift?.crewMemberId, loadData])

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
  }, [shift?.id, getSession, router])

  // Realtime: listen for customer alerts (bell button)
  useEffect(() => {
    if (!tabs.length) return
    const tabIds = tabs.map(t => t.tabId).filter(Boolean)
    if (!tabIds.length) return
    const channel = supabase.channel(`crew-alerts-${shift?.id}`)
    channel.on('postgres_changes' as any, {
      event: 'INSERT',
      schema: 'public',
      table: 'tab_telegram_messages',
      filter: `initiated_by=eq.customer`,
    }, (payload: any) => {
      const msg = payload.new
      if (!msg || !tabIds.includes(msg.tab_id)) return
      // Find the tab
      const matchingTab = tabs.find(t => t.tabId === msg.tab_id)
      setAlertModal({
        tabNumber: matchingTab?.tabNumber || '?',
        tabId: msg.tab_id,
        messageId: msg.id,
      })
    })
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tabs.length, shift?.id])

  async function acknowledgeAlert() {
    if (!alertModal?.tabId) return
    setAcknowledging(true)
    try {
      await (supabase as any)
        .from('tab_telegram_messages')
        .insert({
          tab_id: alertModal.tabId,
          message: 'Waiter is on the way',
          initiated_by: 'system',
          status: 'acknowledged',
        })
      setAlertModal(null)
    } catch {} finally {
      setAcknowledging(false)
    }
  }

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

      {/* Alert Acknowledgment Modal */}
      {alertModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: 'var(--ink-2)', border: '1px solid var(--border)',
            borderRadius: '1.25rem', padding: '2rem 1.5rem',
            maxWidth: 340, width: '90%', textAlign: 'center',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 1rem',
              background: 'rgba(204,0,0,0.15)', border: '2px solid rgba(204,0,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 1s infinite',
            }}>
              <Bell size={24} style={{ color: '#cc0000' }} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cream)', marginBottom: '0.25rem' }}>
              Customer needs assistance
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              at Tab #{alertModal.tabNumber}
            </p>
            <button
              onClick={acknowledgeAlert}
              disabled={acknowledging}
              style={{
                width: '100%', padding: '0.75rem',
                background: acknowledging ? 'rgba(134,239,172,0.3)' : 'var(--amber)',
                border: 'none', borderRadius: '0.75rem',
                color: acknowledging ? 'var(--success)' : 'var(--ink)',
                fontSize: '0.9rem', fontWeight: 700, cursor: acknowledging ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {acknowledging ? 'Sending...' : <><Check size={18} /> Acknowledge</>}
            </button>
          </div>
        </div>
      )}

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
              const barId = shift?.venue?.id
              if (shift?.id && barId) {
                await fetch('/api/shifts/checkout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify({ shift_id: shift.id, bar_id: barId }),
                })
              }
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
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.8) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </>
  )
}
