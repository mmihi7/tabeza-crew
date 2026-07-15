'use client'

import { useState, useEffect } from 'react'
import { getStoredProfilePhotoUrl } from '@/lib/profile-photo'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Clock, AlertTriangle, LogOut, Bell, Star, MapPin, ChevronRight, Briefcase, Camera, Eye, EyeOff, Users, Calendar, DollarSign } from 'lucide-react'
import { FaceBubble } from '@/components/shared/FaceBubble'
import { StatCard } from '@/components/shared/StatCard'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { TableCard } from '@/components/home/TableCard'
import { CheckoutModal } from '@/components/home/CheckoutModal'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useUnreadCounts } from '@/hooks/useUnreadCounts'
import type { AssignedTab, NearbyVenue, HireRequest, ShiftPosting } from '@/lib/types'

// ─── Preview toggle ───────────────────────────────────────────────────────────
type HomeState = 'no_shift' | 'active' | 'ending_soon'
const PREVIEW_STATE: HomeState | null = null

export default function HomePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Real identity from session
  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'there'
  const storedPhotoUrl = getStoredProfilePhotoUrl()

  const firstName = displayName.split(' ')[0]

  // Shift data from API
  const [activeShifts, setActiveShifts] = useState<any[]>([])
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([])
  const [assignedTabs, setAssignedTabs] = useState<AssignedTab[]>([])
  const [shiftState, setShiftState] = useState<HomeState>('no_shift')
  const [loading, setLoading] = useState(true)

  // ── Profile data for home cards ──────────────────────────────────────
  const [hasProfilePhoto, setHasProfilePhoto] = useState<boolean>(!!storedPhotoUrl)
  const [marketplaceVisible, setMarketplaceVisible] = useState<boolean>(true)
  const [updatingVisibility, setUpdatingVisibility] = useState(false)

  // ── Jobs data for home feed ──────────────────────────────────────────
  const [recentPostings, setRecentPostings] = useState<ShiftPosting[]>([])
  const [pendingRequest, setPendingRequest] = useState<HireRequest | null>(null)
  const [loadingJobs, setLoadingJobs] = useState(true)

  // ── Load profile essentials ──────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token
        if (!accessToken) return

        const res = await fetch('/api/crew/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json()
        
        if (data.face_photo_url || data.face_thumbnail_url) {
          setHasProfilePhoto(true)
        }
        if (data.marketplace_visible !== undefined) {
          setMarketplaceVisible(data.marketplace_visible)
        }
      } catch {
        // Silent fail
      }
    }
    loadProfile()
  }, [user?.id])

  // ── Load jobs data for home feed ────────────────────────────────────
  useEffect(() => {
    async function loadJobs() {
      if (!user?.id) {
        setLoadingJobs(false)
        return
      }
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token
        if (!accessToken) {
          setLoadingJobs(false)
          return
        }

        const res = await fetch('/api/jobs', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json()

        // Get first 3 postings
        if (data.postings) {
          const postings = (data.postings as any[]).map(p => ({
            id: p.id,
            barName: p.venue?.name || '',
            barRating: 0,
            role: p.role || '',
            shiftDate: p.shiftDate || '',
            shiftStart: p.shiftStart || '',
            shiftEnd: p.shiftEnd || '',
            payPerShift: p.payPerShift || 0,
            slotsAvailable: p.slotsAvailable || 1,
            preferredTier: p.preferredTier || undefined,
            location: '',
            lat: p.lat,
            lng: p.lng,
          }))
          setRecentPostings(postings.slice(0, 3))
        }

        // Get first pending hire request
        if (data.hireRequests) {
          const pending = (data.hireRequests as any[])
            .filter(r => r.status === 'pending')
            .map(hr => ({
              id: hr.id,
              barName: hr.venue?.name || '',
              managerName: '',
              managerFaceUrl: undefined,
              role: hr.role || '',
              shiftDate: hr.shiftDate || '',
              shiftStart: hr.shiftStart || '',
              shiftEnd: hr.shiftEnd || '',
              payAmount: hr.payAmount || 0,
              message: hr.message || '',
              status: hr.status || 'pending',
              expiresAt: hr.expiresAt || '',
            }))
          setPendingRequest(pending[0] || null)
        }
      } catch {
        // Silent fail
      } finally {
        setLoadingJobs(false)
      }
    }
    loadJobs()
  }, [user?.id])

  // ── Toggle marketplace visibility ────────────────────────────────────
  async function toggleMarketplaceVisibility() {
    if (!user?.id) return
    
    setUpdatingVisibility(true)
    const newValue = !marketplaceVisible
    
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) return

      const res = await fetch('/api/crew/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ marketplace_visible: newValue }),
      })
      
      if (res.ok) {
        setMarketplaceVisible(newValue)
      }
    } catch {
      // Silent fail
    } finally {
      setUpdatingVisibility(false)
    }
  }

  // Load shift data
  useEffect(() => {
    if (user === null) {
      console.log('[home] No user authenticated, skipping shift load')
      setLoading(false)
      return
    }

    const userId = user.id
    const currentUser = user

    async function loadShifts() {
      try {
        const { data: crew } = await (supabase as any)
          .from('crew_members')
          .select('id')
          .eq('user_id', userId)
          .single()
        
        if (!crew?.id) {
          console.log('[home] Creating crew_members record for user')
          const { data: sessionData } = await supabase.auth.getSession()
          const accessToken = sessionData.session?.access_token
          if (accessToken) {
            await fetch('/api/staff/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                display_name:
                  currentUser.user_metadata?.display_name ??
                  currentUser.user_metadata?.full_name ??
                  currentUser.email?.split('@')[0],
                phone_number:
                  currentUser.user_metadata?.phone ??
                  currentUser.email ??
                  '',
                location: '',
                preferred_roles: [],
              }),
            })
          }
        }

        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token
        if (!accessToken) {
          setLoading(false)
          return
        }
        const res = await fetch('/api/shifts', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json()
        setActiveShifts(data.activeShifts || [])
        setUpcomingShifts(data.upcomingShifts || [])
        setAssignedTabs(data.assignedTabs || [])
        setShiftState(data.activeShifts?.length > 0 ? 'active' : 'no_shift')
      } catch (err) {
        console.error('[home] Error loading shifts:', err)
      } finally {
        setLoading(false)
      }
    }
    loadShifts()
  }, [user])

  // ── No active shift ─────────────────────────────────────────────────────
  if (shiftState === 'no_shift') {
    return (
      <div className="page-content" style={{ background: '#ffffff', padding: 0 }}>
        
        {/* ── HERO HEADER - Full width, 1/3 of viewport ──────── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '33dvh',
            minHeight: 200,
            maxHeight: 400,
            background: 'var(--background-tertiary)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: storedPhotoUrl 
                ? 'linear-gradient(135deg, rgba(255,79,0,0.4) 0%, rgba(255,79,0,0.1) 100%)'
                : 'linear-gradient(135deg, var(--amber) 0%, var(--amber-dark) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {storedPhotoUrl ? (
              <Image
                src={storedPhotoUrl}
                alt={displayName}
                width={800}
                height={600}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                priority
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#fff', padding: '1.5rem' }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                  {firstName}
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                  {marketplaceVisible ? '👋 Available for hire' : '😴 Not visible on marketplace'}
                </p>
              </div>
            )}
          </div>

          {/* Gradient overlay for text readability */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Profile info overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '1.25rem',
              right: '1.25rem',
              color: '#fff',
            }}
          >
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.15rem' }}>
              {firstName}
            </h1>
            <p style={{ fontSize: '0.8rem', opacity: 0.85 }}>
              {marketplaceVisible ? '👋 Available for hire' : '😴 Not visible on marketplace'}
            </p>
          </div>

          {/* Camera button for photo upload */}
          <button
            onClick={() => router.push('/waiter/me/photos')}
            style={{
              position: 'absolute',
              top: '0.875rem',
              right: '0.875rem',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Camera size={17} style={{ color: '#fff' }} />
          </button>
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <div style={{ padding: '1rem 1rem 2rem' }}>

          {/* No active shift status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'var(--background-secondary)',
              borderRadius: '0.75rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-default)',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No active shift</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
              {recentPostings.length} openings nearby
            </span>
          </div>

          {/* ── Action cards ────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            
            {/* Add photo card - only if no photo exists yet */}
            {!hasProfilePhoto && (
              <div 
                className="card" 
                style={{ 
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  border: '2px solid var(--amber)',
                  background: 'rgba(255,79,0,0.06)',
                }}
                onClick={() => router.push('/waiter/me/photos')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '0.75rem',
                    background: 'var(--amber)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Camera size={20} style={{ color: '#1a1a2e' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Add your photo 📸
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Profiles with a face photo get 3× more hire requests
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </div>
            )}

            {/* Marketplace visibility toggle card */}
            <div className="card" style={{ padding: '0.875rem 1rem', background: 'var(--background-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '0.75rem',
                  background: marketplaceVisible ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${marketplaceVisible ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {marketplaceVisible ? (
                    <Eye size={20} style={{ color: 'var(--success)' }} />
                  ) : (
                    <EyeOff size={20} style={{ color: 'var(--error)' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {marketplaceVisible ? 'Visible on marketplace' : 'Hidden from marketplace'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {marketplaceVisible 
                      ? 'Venues can find and hire you' 
                      : 'You won\'t appear in venue searches'}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMarketplaceVisibility()
                  }}
                  disabled={updatingVisibility}
                  style={{
                    position: 'relative',
                                    width: 44,
                    height: 24,
                    borderRadius: '12px',
                    background: marketplaceVisible ? 'var(--amber)' : 'var(--background-tertiary)',
                    border: '1px solid',
                    borderColor: marketplaceVisible ? 'var(--amber)' : 'var(--border-default)',
                    cursor: updatingVisibility ? 'not-allowed' : 'pointer',
                    opacity: updatingVisibility ? 0.6 : 1,
                    transition: 'all 0.2s',
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: marketplaceVisible ? 22 : 2,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ── Pending Hire Request ───────────────────────────── */}
          {pendingRequest && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🎯 Pending Request
                </h2>
                <button
                  onClick={() => router.push('/waiter/jobs?tab=requests')}
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-tertiary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  View all →
                </button>
              </div>
              <div
                className="card"
                style={{
                  padding: '0.875rem 1rem',
                  background: 'rgba(255,79,0,0.06)',
                  border: '1px solid rgba(255,79,0,0.2)',
                  cursor: 'pointer',
                }}
                onClick={() => router.push('/waiter/jobs?tab=requests')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--amber-pale)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '1.25rem',
                  }}>
                    📩
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {pendingRequest.barName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {pendingRequest.role} · {pendingRequest.shiftDate}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--amber)', fontWeight: 600 }}>
                      KES {pendingRequest.payAmount.toLocaleString()}
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </div>
            </div>
          )}

          {/* ── Job Openings ────────────────────────────────────── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                💼 Openings
              </h2>
              <button
                onClick={() => router.push('/waiter/jobs')}
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-tertiary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                View all →
              </button>
            </div>

            {recentPostings.length === 0 ? (
              <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--background-secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No openings right now</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Check back soon</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {recentPostings.map(posting => (
                  <div
                    key={posting.id}
                    className="card"
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      background: 'var(--background-secondary)',
                    }}
                    onClick={() => router.push(`/waiter/jobs?posting=${posting.id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '0.75rem',
                        background: 'var(--amber-pale)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '1.25rem',
                      }}>
                        🏢
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {posting.barName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            {posting.role}
                          </span>
                          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            {posting.shiftDate}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber)' }}>
                          KES {posting.payPerShift.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                          {posting.slotsAvailable} slot{posting.slotsAvailable !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Browse all jobs CTA ────────────────────────────── */}
          <button
            className="btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'var(--background-secondary)',
              border: '1px solid var(--border-default)',
            }}
            onClick={() => router.push('/waiter/jobs')}
          >
            <Briefcase size={16} />
            Browse all job openings
          </button>

          {/* Logout */}
          <button
            className="btn-ghost"
            style={{
              width: '100%',
              marginTop: '1.5rem',
              color: 'var(--text-tertiary)',
              borderColor: 'var(--border-default)',
              fontSize: '0.8rem',
            }}
            onClick={async () => { await signOut(); router.replace('/auth/login') }}
          >
            <LogOut size={14} style={{ color: 'var(--text-tertiary)' }} />
            Log Out
          </button>

        </div>
      </div>
    )
  }

  // ── Active shift view ───────────────────────────────────────────────────────
  const isEndingSoon = shiftState === 'ending_soon'
  const openTabs: AssignedTab[] = []

  return (
    <>
      <div className="page-content" style={{ background: '#ffffff', padding: 0 }}>
        
        {/* ── HERO HEADER - Active shift ──────────────────────── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '30dvh',
            minHeight: 180,
            maxHeight: 320,
            background: storedPhotoUrl 
              ? 'linear-gradient(135deg, rgba(255,79,0,0.3) 0%, rgba(255,79,0,0.1) 100%)'
              : 'linear-gradient(135deg, var(--amber) 0%, var(--amber-dark) 100%)',
            overflow: 'hidden',
          }}
        >
          {storedPhotoUrl ? (
            <Image
              src={storedPhotoUrl}
              alt={displayName}
              width={800}
              height={400}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              priority
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '1.25rem',
              right: '1.25rem',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{firstName}</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                padding: '0.15rem 0.6rem',
                borderRadius: '999px',
                background: 'rgba(34,197,94,0.9)',
                color: '#fff',
              }}>
                ON SHIFT
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={14} />
              6:00 PM – 2:00 AM · 3h 22m in
            </div>
          </div>

          <button
            onClick={() => router.push('/waiter/me/photos')}
            style={{
              position: 'absolute',
              top: '0.875rem',
              right: '0.875rem',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Camera size={17} style={{ color: '#fff' }} />
          </button>
        </div>

        {/* ── Active shift content ────────────────────────────── */}
        <div style={{ padding: '1rem 1rem 2rem' }}>

          {/* Ending-soon warning banner */}
          {isEndingSoon && (
            <div className="shift-warning-banner" style={{ marginBottom: '1rem' }}>
              <AlertTriangle size={18} style={{ color: 'var(--amber)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Your shift ends in 28 minutes
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {openTabs.length} tables still open — clear or hand off before checkout
                </div>
              </div>
            </div>
          )}

          {/* Today's stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <StatCard label="Tips" value="KES 0" accent />
            <StatCard label="Orders" value="0" sublabel="approved" />
            <StatCard label="Points" value="+0" sublabel="today" />
          </div>

          {/* My Tables */}
          <SectionHeading
            title="My Tables"
            description={openTabs.length === 0
              ? 'No active tables — new customer tabs will appear here'
              : `${openTabs.length} active · unassigned tabs also shown`}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
            {openTabs.map(tab => (
              <TableCard key={tab.id} tab={tab} onTap={() => router.push(`/waiter/tabs/${tab.id}`)} />
            ))}
          </div>

          {/* Checkout button */}
          <button
            className={isEndingSoon && openTabs.length > 0 ? 'btn-ghost' : 'btn-primary'}
            style={{ width: '100%', gap: '0.5rem' }}
            onClick={() => setCheckoutOpen(true)}
            disabled={isEndingSoon && openTabs.length > 0}
          >
            {isEndingSoon && openTabs.length > 0 ? (
              <>
                <AlertTriangle size={16} />
                Clear all tables to check out
              </>
            ) : (
              <>
                <LogOut size={16} />
                Check Out
              </>
            )}
          </button>

          {/* Logout */}
          <button
            className="btn-ghost"
            style={{
              width: '100%',
              marginTop: '1rem',
              color: 'var(--text-tertiary)',
              borderColor: 'var(--border-default)',
              fontSize: '0.8rem',
            }}
            onClick={async () => { await signOut(); router.replace('/auth/login') }}
          >
            <LogOut size={14} style={{ color: 'var(--text-tertiary)' }} />
            Log Out
          </button>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal
          shiftSummary={{ orders: 0, tips: 0, points: 0, hoursWorked: '0h' }}
          onClose={() => setCheckoutOpen(false)}
          onConfirm={async () => {
            await signOut()
            router.replace('/auth/login')
          }}
        />
      )}
    </>
  )
}