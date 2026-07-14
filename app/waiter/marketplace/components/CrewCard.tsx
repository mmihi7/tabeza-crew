'use client'

import Image from 'next/image'
import { Star, MapPin, Check } from 'lucide-react'
import { formatPublicName } from '@/lib/nameService'
import { KENYA_LOCATIONS } from '@/lib/locations'
import type { CrewResult } from '../types'

interface CrewCardProps {
  crew: CrewResult
  onOffer: (crew: CrewResult) => void
}

export default function CrewCard({ crew, onOffer }: CrewCardProps) {
  const location = crew.preferred_locations?.[0] 
    ? KENYA_LOCATIONS.find(l => l.id === crew.preferred_locations[0]) 
    : null

  const isMarketplaceReady = !!crew.face_photo_url && 
    (crew.preferred_roles?.length ?? 0) > 0 && 
    (crew.preferred_locations?.length ?? 0) > 0

  // Check what's missing for display
  const missingItems: string[] = []
  if (!crew.face_photo_url) missingItems.push('📷 No photo')
  if ((crew.preferred_roles?.length ?? 0) === 0) missingItems.push('📋 No roles')
  if ((crew.preferred_locations?.length ?? 0) === 0) missingItems.push('📍 No location')

  return (
    <div className="marketplace-gallery-card" style={{
      background: '#1a1a2e',
      border: `1px solid ${isMarketplaceReady ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    }}>
      {/* ── Photo / Cover Image (2:1 aspect ratio) ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '2 / 1',
        background: crew.face_photo_url ? 'transparent' : 'var(--background-tertiary)',
        overflow: 'hidden',
      }}>
        {crew.face_photo_url ? (
          <Image
            src={crew.face_photo_url}
            alt={crew.display_name}
            fill
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.2)',
          }}>
            {crew.display_name?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
        
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        
        {/* Profile info overlay */}
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '0.875rem',
          right: '0.875rem',
          color: '#fff',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: 700, 
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              {formatPublicName(crew.display_name)}
              {isMarketplaceReady && (
                <Check size={12} style={{ color: '#22c55e' }} />
              )}
            </div>
            <div style={{ 
              fontSize: '0.7rem', 
              opacity: 0.85, 
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}>
              <MapPin size={10} />
              {location ? location.name : 'No location'}
            </div>
          </div>
          {crew.performance_score > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}>
              <Star size={12} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
              {crew.performance_score.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '0.75rem 0.875rem' }}>
        {/* Roles */}
        {(crew.preferred_roles?.length ?? 0) > 0 && (
          <div style={{ marginBottom: '0.625rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {crew.preferred_roles.slice(0, 3).map((role: string) => (
                <span key={role} style={{
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                }}>
                  {role}
                </span>
              ))}
              {(crew.preferred_roles?.length ?? 0) > 3 && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  +{(crew.preferred_roles?.length ?? 0) - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingTop: '0.625rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '0.75rem',
        }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
            <span style={{ fontWeight: 600, color: '#fff' }}>{crew.total_shifts_completed || 0}</span> shifts
          </div>
          {(crew.total_likes ?? 0) > 0 && (
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>{crew.total_likes}</span> likes
            </div>
          )}
        </div>

        {/* Action button */}
        {isMarketplaceReady ? (
          <button
            onClick={() => onOffer(crew)}
            style={{
              width: '100%',
              padding: '0.4rem 0.75rem',
              background: 'var(--amber)',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--ink)',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            Hire {formatPublicName(crew.display_name)}
          </button>
        ) : (
          <div style={{
            width: '100%',
            padding: '0.4rem 0.75rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '0.5rem',
            fontSize: '0.7rem',
            fontWeight: 500,
            color: 'var(--error)',
            textAlign: 'center',
          }}>
            {missingItems.join(' · ')}
          </div>
        )}
      </div>
    </div>
  )
}