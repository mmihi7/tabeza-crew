'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Briefcase, GraduationCap, Sparkles, Check, Eye, AlertCircle, PlusCircle, Camera, Star, MapPin, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getStoredProfilePhotoUrl } from '@/lib/profile-photo'
import { getDefaultAvatarStyle } from '@/lib/utils'
import { formatPublicName } from '@/lib/nameService'
import { KENYA_LOCATIONS } from '@/lib/locations'
import type { Credential, Skill } from '@/lib/types'

export default function PublicProfilePreviewPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const storedPhotoUrl = getStoredProfilePhotoUrl()
  const { background: avatarBg, initials } = getDefaultAvatarStyle(
    user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  )

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) { setLoading(false); return }
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token
        if (!accessToken) { setLoading(false); return }

        const res = await fetch('/api/crew/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json()
        
        setProfile({
          ...data,
          credentials: data.credentials || [],
          skills: data.skills || [],
          preferred_roles: data.preferred_roles || [],
          location: data.location || '',
        })
      } catch {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [user?.id])

  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Your Profile'

  // Get real data from profile
  const realRoles = profile?.preferred_roles || []
  const realCredentials = profile?.credentials || []
  const realSkills = profile?.skills || []
  const realBio = profile?.bio || ''
  const totalShifts = profile?.total_shifts_completed || 0
  const performanceScore = profile?.performance_score || 0
  const locationId = profile?.location || ''
  const location = locationId ? KENYA_LOCATIONS.find(l => l.id === locationId) : null

  // Check requirements for marketplace visibility
  const hasPhoto = !!storedPhotoUrl
  const hasRoles = realRoles.length > 0
  const hasLocation = !!locationId
  const isMarketplaceReady = hasPhoto && hasRoles && hasLocation
  const missingItems = []
  if (!hasPhoto) missingItems.push('Profile Photo')
  if (!hasRoles) missingItems.push('Roles')
  if (!hasLocation) missingItems.push('Location')

  // Format public name
  const publicName = formatPublicName(displayName)

  return (
    <div style={{ 
      background: '#f5f5f5', 
      minHeight: '100vh', 
      padding: '1rem',
      display: 'flex',
      justifyContent: 'center',
    }}>
      
      <div style={{ 
        maxWidth: 480,
        width: '100%',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: '0.5rem',
              background: '#fff',
              border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Public Profile Preview
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              How venues and customers see you
            </p>
          </div>
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.65rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            background: isMarketplaceReady ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)',
            color: isMarketplaceReady ? 'var(--success)' : 'var(--error)',
            border: `1px solid ${isMarketplaceReady ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}>
            {isMarketplaceReady ? <Check size={12} /> : <AlertCircle size={12} />}
            {isMarketplaceReady ? 'Visible' : 'Incomplete'}
          </span>
        </div>

        {/* ── Marketplace Card Preview ── */}
        <div style={{
          background: '#1a1a2e',
          border: `1px solid ${isMarketplaceReady ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`,
          borderRadius: '0.75rem',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        }}>
          {/* ── Photo / Cover Image (2:1 aspect ratio) ── */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '2 / 1',
            background: storedPhotoUrl ? 'transparent' : `linear-gradient(135deg, ${avatarBg} 0%, var(--background-tertiary) 100%)`,
            overflow: 'hidden',
          }}>
            {storedPhotoUrl ? (
              <Image
                src={storedPhotoUrl}
                alt={displayName}
                fill
                style={{ objectFit: 'cover' }}
                priority
                sizes="(max-width: 480px) 100vw, 480px"
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.3)',
              }}>
                <Camera size={32} />
                <span style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>No photo</span>
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
                <div style={{ fontSize: '1rem', fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                  {publicName}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.85, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                  {location ? location.name : 'No location set'}
                </div>
              </div>
              {performanceScore > 0 && (
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
                  {performanceScore.toFixed(1)}
                </div>
              )}
            </div>

            {/* Missing overlay when not ready */}
            {!isMarketplaceReady && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(2px)',
              }}>
                <div style={{
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}>
                  <AlertCircle size={14} style={{ color: 'var(--error)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: 600 }}>
                    Missing: {missingItems.join(' & ')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Content ── */}
          <div style={{ padding: '0.75rem 0.875rem' }}>
            {/* Bio */}
            {realBio && (
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {realBio}
              </p>
            )}

            {/* Roles */}
            {realRoles.length > 0 && (
              <div style={{ marginBottom: '0.625rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {realRoles.slice(0, 3).map((role: string) => (
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
                  {realRoles.length > 3 && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 500,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.4)',
                    }}>
                      +{realRoles.length - 3}
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
            }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>{totalShifts}</span> shifts
              </div>
              {realCredentials.length > 0 && (
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{realCredentials.length}</span> credentials
                </div>
              )}
              {realSkills.length > 0 && (
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{realSkills.length}</span> skills
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Full Details Section ── */}
        <div style={{ marginTop: '1.25rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Full Profile Details
          </h3>

          {/* Location */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '0.3rem' }} /> Location
            </div>
            {location ? (
              <div style={{
                padding: '0.4rem 0.6rem',
                background: 'var(--background-secondary)',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
              }}>
                {location.name} · {location.county}
              </div>
            ) : (
              <div style={{
                padding: '0.4rem 0.6rem',
                background: 'var(--background-secondary)',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
              }}>
                No location set — required for marketplace visibility
              </div>
            )}
          </div>

          {/* Credentials */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '0.4rem',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <GraduationCap size={14} style={{ display: 'inline', marginRight: '0.3rem' }} /> Credentials
              </div>
              {realCredentials.length === 0 && (
                <button
                  onClick={() => router.push('/waiter/me')}
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: 'var(--amber)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  <PlusCircle size={12} /> Add credentials
                </button>
              )}
            </div>
            
            {realCredentials.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {realCredentials.map((cred: Credential) => (
                  <div key={cred.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    padding: '0.4rem 0.6rem',
                    background: 'var(--background-secondary)',
                    borderRadius: '0.375rem',
                  }}>
                    {cred.isVerified && <Check size={12} style={{ color: 'var(--success)' }} />}
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{cred.title}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                      {cred.institution} {cred.yearObtained ? `· ${cred.yearObtained}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '0.5rem 0.75rem',
                background: 'var(--background-secondary)',
                borderRadius: '0.375rem',
              }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  No credentials added yet
                </p>
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '0.4rem',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Sparkles size={14} style={{ display: 'inline', marginRight: '0.3rem' }} /> Skills
              </div>
              {realSkills.length === 0 && (
                <button
                  onClick={() => router.push('/waiter/me')}
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: 'var(--amber)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  <PlusCircle size={12} /> Add skills
                </button>
              )}
            </div>
            
            {realSkills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {realSkills.map((skill: Skill) => (
                  <span key={skill.id} style={{
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    background: 'rgba(200,134,26,0.08)',
                    border: '1px solid rgba(200,134,26,0.15)',
                    color: 'var(--amber)',
                  }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '0.5rem 0.75rem',
                background: 'var(--background-secondary)',
                borderRadius: '0.375rem',
              }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  No skills added yet
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
            This is a preview. Update your profile from the <button
              onClick={() => router.push('/waiter/me')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--amber)',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.65rem',
                textDecoration: 'underline',
              }}
            >Me</button> page.
          </p>
        </div>
      </div>
    </div>
  )
}