'use client'

import { Star, MapPin, Send, GraduationCap, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getLocationById } from '@/lib/locations'

export interface CrewResult {
  id: string
  display_name: string
  bio?: string
  performance_score: number
  total_shifts_completed: number
  total_approved_orders: number
  preferred_roles: string[]
  location: string
  badge_tier: 'standard' | 'silver' | 'gold'
  face_photo_url?: string
  face_thumbnail_url?: string
  half_body_photo_url?: string
  distance_km?: number
  credentials?: Array<{
    id: string
    type: string
    title: string
    institution: string
    yearObtained?: string
    isVerified: boolean
  }>
  skills?: Array<{
    id: string
    name: string
    level: 'beginner' | 'intermediate' | 'expert'
    category: string
  }>
}

export const BADGE_LABEL = {
  standard: 'Standard',
  silver: '🥈 Silver',
  gold: '🥇 Gold',
}

export const BADGE_COLOR = {
  standard: { bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.15)', color: 'var(--muted)' },
  silver:   { bg: 'rgba(192,192,192,0.15)', border: 'rgba(192,192,192,0.3)',  color: '#c0c0c0' },
  gold:     { bg: 'rgba(200,134,26,0.15)',  border: 'rgba(200,134,26,0.3)',   color: 'var(--amber)' },
}

export function formatPublicName(name: string): string {
  if (!name) return 'Staff Member'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return name
  if (parts.length === 1) return parts[0]
  const first = parts[0]
  const lastInitial = parts[parts.length - 1][0].toUpperCase()
  return `${first} ${lastInitial}`
}

interface CrewCardProps {
  crew: CrewResult | null | undefined
  onOffer: (crew: CrewResult) => void
}

export default function CrewCard({ crew, onOffer }: CrewCardProps) {
  const router = useRouter()
  
  if (!crew || !crew.id) {
    return null
  }
  
  const badgeTier = crew.badge_tier || 'standard'
  const bc = BADGE_COLOR[badgeTier] || BADGE_COLOR.standard
  
  const heroImg = crew.half_body_photo_url || crew.face_photo_url || crew.face_thumbnail_url
  const colors = ['#C8861A','#3b82f6','#10b981','#ef4444','#8b5cf6']
  const hash = crew.display_name ? crew.display_name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 0
  const avatarBg = colors[hash % colors.length]
  const initials = crew.display_name ? crew.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'

  const location = crew.location ? getLocationById(crew.location) : null
  const locationName = location ? location.name : null

  const credentials = crew.credentials || []
  const skills = crew.skills || []

  return (
    <div
      className="marketplace-gallery-card"
      style={{
        background: '#fff',
        borderRadius: '1rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
      }}
      onClick={() => router.push(`/marketplace/staff/${crew.id}`)}
    >
      {/* ── Photo Container (Fixed height) ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '180px', // ✅ Fixed height for consistency
        background: heroImg ? '#f0f0f0' : avatarBg,
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {heroImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImg}
            alt={crew.display_name || 'Staff'}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              objectPosition: 'center top', 
              display: 'block' 
            }}
          />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            color: '#1a1a2e' 
          }}>
            {initials}
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.74) 100%)' }} />
        <span style={{
          position: 'absolute', top: 10, right: 10, fontSize: '0.62rem', fontWeight: 700,
          padding: '0.18rem 0.55rem', borderRadius: '999px',
          background: bc.bg, border: `1px solid ${bc.border}`,
          color: bc.color, backdropFilter: 'blur(6px)',
        }}>
          {BADGE_LABEL[badgeTier] || 'Standard'}
        </span>
        {locationName && (
          <span style={{
            position: 'absolute', bottom: 10, left: 10, fontSize: '0.62rem', fontWeight: 600,
            padding: '0.18rem 0.55rem', borderRadius: '999px',
            background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}>
            <MapPin size={10} />
            {locationName}
          </span>
        )}
      </div>

      {/* ── Content (Fixed height with flex) ── */}
      <div style={{ 
        padding: '0.85rem', 
        background: '#fff', 
        flex: '1',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        minHeight: '165px', // ✅ Fixed minimum height for consistency
      }}>
        {/* Top section - all content aligns from top */}
        <div>
          {/* Row 1: Name and Rating */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <div style={{ 
              fontSize: '0.95rem', 
              fontWeight: 700, 
              color: '#1a1a2e', 
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}>
              {formatPublicName(crew.display_name || '')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#C8861A', flexShrink: 0 }}>
              <Star size={12} style={{ fill: '#C8861A' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a1a2e' }}>
                {crew.performance_score ? crew.performance_score.toFixed(1) : '0.0'}
              </span>
            </div>
          </div>

          {/* Row 2: Location (single line) */}
          <div style={{
            fontSize: '0.7rem',
            color: '#6b7280',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '0.2rem',
            height: '18px', // ✅ Fixed height
          }}>
            <MapPin size={11} style={{ color: '#9ca3af', flexShrink: 0 }} />
            {locationName || 'No location set'}
          </div>

          {/* Row 3: Roles (single line) */}
          <div style={{
            fontSize: '0.72rem',
            color: '#4b5563',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '0.2rem',
            height: '20px', // ✅ Fixed height
          }}>
            {crew.preferred_roles && crew.preferred_roles.length > 0 ? (
              <>
                {crew.preferred_roles.slice(0, 3).join(' · ')}
                {crew.preferred_roles.length > 3 && ` +${crew.preferred_roles.length - 3}`}
              </>
            ) : (
              <span style={{ color: '#9ca3af' }}>No roles set</span>
            )}
          </div>

          {/* Row 4: Credentials (single line) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            marginBottom: '0.2rem',
            height: '20px', // ✅ Fixed height
          }}>
            <GraduationCap size={11} style={{ color: '#9ca3af', flexShrink: 0 }} />
            {credentials.length > 0 ? (
              <>
                <span style={{
                  fontSize: '0.68rem',
                  color: '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {credentials[0].title}
                </span>
                {credentials.length > 1 && (
                  <span style={{
                    fontSize: '0.6rem',
                    color: '#9ca3af',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    +{credentials.length - 1}
                  </span>
                )}
              </>
            ) : (
              <span style={{
                fontSize: '0.68rem',
                color: '#9ca3af',
                fontStyle: 'italic',
              }}>
                No credentials
              </span>
            )}
          </div>

          {/* Row 5: Skills (single line) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            height: '24px', // ✅ Fixed height
          }}>
            <Sparkles size={11} style={{ color: '#9ca3af', flexShrink: 0 }} />
            {skills.length > 0 ? (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  overflow: 'hidden',
                  flex: 1,
                }}>
                  {skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill.id}
                      style={{
                        fontSize: '0.6rem',
                        padding: '0.1rem 0.4rem',
                        background: 'rgba(200,134,26,0.08)',
                        border: '1px solid rgba(200,134,26,0.15)',
                        borderRadius: '999px',
                        color: 'var(--amber)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {skill.name}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span
                      style={{
                        fontSize: '0.6rem',
                        color: '#9ca3af',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      +{skills.length - 3}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <span style={{
                fontSize: '0.68rem',
                color: '#9ca3af',
                fontStyle: 'italic',
              }}>
                No skills
              </span>
            )}
          </div>
        </div>

        {/* Bottom section - Action buttons (always at bottom) */}
        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid #f3f4f6' }}>
          <button
            onClick={e => { e.stopPropagation(); router.push(`/marketplace/staff/${crew.id}`) }}
            style={{
              flex: 1, padding: '0.45rem 0.5rem', background: '#f3f4f6',
              border: 'none', borderRadius: '0.45rem', fontSize: '0.72rem',
              fontWeight: 600, color: '#1a1a2e', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
            onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
          >
            Profile
          </button>
          <button
            onClick={e => { e.stopPropagation(); onOffer(crew) }}
            style={{
              flex: 1, padding: '0.45rem 0.5rem', background: '#C8861A',
              border: 'none', borderRadius: '0.45rem', fontSize: '0.72rem',
              fontWeight: 700, color: '#1a1a2e', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#A86A10'}
            onMouseLeave={e => e.currentTarget.style.background = '#C8861A'}
          >
            <Send size={11} /> Offer
          </button>
        </div>
      </div>
    </div>
  )
}