'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Clock, CalendarDays, Briefcase, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const STORAGE_KEY = 'tabeza-shift-confirmed'

export default function CheckinPage() {
  const router = useRouter()
  const { user, getSession } = useAuth()
  const [shift, setShift] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadShift = useCallback(async () => {
    try {
      const session = getSession()
      const accessToken = session?.access_token
      if (!accessToken) { setLoading(false); return }

      const res = await fetch('/api/shifts', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const data = await res.json()

      const activeShift = data.activeShifts?.[0]
      if (!activeShift) {
        router.replace('/waiter')
        return
      }

      const confirmed = localStorage.getItem(`${STORAGE_KEY}-${activeShift.id}`)
      if (confirmed) {
        router.replace('/waiter/tabs')
        return
      }

      setShift(activeShift)
    } catch {
      router.replace('/waiter')
    } finally {
      setLoading(false)
    }
  }, [getSession, router])

  useEffect(() => {
    if (!user?.id) return
    loadShift()
  }, [user?.id, loadShift])

  function handleConfirm() {
    if (!shift?.id) return
    localStorage.setItem(`${STORAGE_KEY}-${shift.id}`, 'true')
    router.replace('/waiter/tabs')
  }

  function handleBack() {
    router.replace('/waiter')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--ink)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--amber)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!shift) return null

  const shiftDate = new Date(shift.shiftStart)
  const formattedDate = shiftDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const formattedStart = shiftDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const formattedEnd = new Date(shift.shiftEnd).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const venueName = shift.venue?.name || 'Venue'

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--ink)',
      display: 'flex', flexDirection: 'column',
      padding: '1.5rem', paddingTop: '2rem',
      userSelect: 'none',
      WebkitTouchCallout: 'none',
    }}>
      {/* Back */}
      <button onClick={handleBack} style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer',
        color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 500,
        alignSelf: 'flex-start', marginBottom: '3rem',
      }}>
        <ArrowLeft size={16} />
        Back to Home
      </button>

      {/* Center content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '1rem',
          background: 'rgba(134,239,172,0.12)',
          border: '1px solid rgba(134,239,172,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          <Check size={32} style={{ color: 'var(--success)' }} />
        </div>

        <h1 style={{
          fontSize: '1.25rem', fontWeight: 700, color: 'var(--cream)',
          marginBottom: '0.5rem',
        }}>
          {venueName}
        </h1>

        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
          Your shift has been approved
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
          borderRadius: '0.75rem', padding: '1rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          marginBottom: '2.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem' }}>
            <Briefcase size={14} />
            <span style={{ color: 'var(--cream)', fontWeight: 600 }}>{shift.role}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem' }}>
            <CalendarDays size={14} />
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem' }}>
            <Clock size={14} />
            <span>{formattedStart} – {formattedEnd}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button onClick={handleConfirm} style={{
          width: '100%', padding: '0.875rem',
          background: 'var(--amber)', border: 'none', borderRadius: '0.75rem',
          fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)',
          cursor: 'pointer',
        }}>
          Confirm & Start Shift
        </button>
        <button onClick={handleBack} style={{
          width: '100%', padding: '0.875rem',
          background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
          borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight: 600,
          color: 'var(--muted)', cursor: 'pointer',
        }}>
          Back to Home
        </button>
      </div>
    </div>
  )
}
