'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Camera, ChevronRight, Bell, CreditCard, Shield,
  LogOut, ExternalLink,
  GraduationCap, Plus, Trash2, Sparkles, Check, X,
  Edit3, MapPin, Search, Navigation, Save
} from 'lucide-react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { getDefaultAvatarStyle } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { getStoredProfilePhotoUrl } from '@/lib/profile-photo'
import { getSuggestedSkillsForRoles, GENERAL_SKILLS } from '@/lib/skillsDatabase'
import { KENYA_LOCATIONS, searchLocations } from '@/lib/locations'
import { formatPublicName } from '@/lib/nameService'
import type { Credential, Skill, CredentialType } from '@/lib/types'

const CREDENTIAL_TYPE_LABELS: Record<CredentialType, string> = {
  diploma: 'Diploma',
  certificate: 'Certificate',
  degree: 'Degree',
  license: 'License',
  training: 'Training',
  other: 'Other',
}

const SUGGESTED_ROLES = [
  { category: 'FOH', roles: ['Waiter', 'Head Waiter', 'Bartender', 'Head Bartender', 'Bar Back', 'Mixologist'] },
  { category: 'BOH', roles: ['Chef', 'Head Chef', 'Line Cook', 'Kitchen Assistant'] },
  { category: 'Management', roles: ['Bar Manager', 'Floor Manager', 'Kitchen Manager'] },
  { category: 'Support', roles: ['Bouncer', 'Security Guard', 'VIP Host', 'Bottle Service', 'Promoter', 'Cashier', 'Cleaner', 'Barista'] },
]

// Example bio placeholder
const EXAMPLE_BIO = "Passionate hospitality professional with 5+ years of experience in fast-paced restaurants and bars. Dedicated to creating memorable guest experiences through attentive service and a warm, welcoming approach."

export default function MePage() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Your Profile'

  const storedPhotoUrl = getStoredProfilePhotoUrl()
  const { background: avatarBg, initials } = getDefaultAvatarStyle(displayName)
  const [roles, setRoles] = useState<string[]>([])
  const [savingRoles, setSavingRoles] = useState(false)
  const [marketplaceVisible, setMarketplaceVisible] = useState(true)
  const [profileBio, setProfileBio] = useState('')
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [tempBio, setTempBio] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── Location state ──
  const [location, setLocation] = useState<string>('')
  const [locationSearch, setLocationSearch] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<typeof KENYA_LOCATIONS>([])
  const [isSearching, setIsSearching] = useState(false)

  // ── Credentials ────────────────────────────────────────────────────────
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [showCredForm, setShowCredForm] = useState(false)
  const [newCred, setNewCred] = useState<Omit<Credential, 'id' | 'isVerified' | 'documentUrl'>>({
    type: 'certificate',
    title: '',
    institution: '',
    yearObtained: '',
  })

  // ── Skills ─────────────────────────────────────────────────────────────
  const [skills, setSkills] = useState<Skill[]>([])
  const [showSkillInput, setShowSkillInput] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  // ── Load profile data ──────────────────────────────────────────────
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
        
        if (data.preferred_roles) setRoles(data.preferred_roles)
        if (data.marketplace_visible !== undefined) {
          setMarketplaceVisible(data.marketplace_visible)
        }
        if (data.bio) setProfileBio(data.bio)
        setTempBio(data.bio || '')
        if (data.credentials) setCredentials(data.credentials)
        if (data.skills) setSkills(data.skills)
        if (data.location) {
          setLocation(data.location)
        }
      } catch (err) {
        console.error('[Me] Error loading profile:', err)
      }
    }
    loadProfile()
  }, [user?.id])

  // ── Location search effect ──
  useEffect(() => {
    if (locationSearch.length < 2) {
      setLocationSuggestions([])
      return
    }
    setIsSearching(true)
    const results = searchLocations(locationSearch)
    setLocationSuggestions(results)
    setIsSearching(false)
  }, [locationSearch])

  // ── Save all profile data ──────────────────────────────────────────
  async function saveProfile() {
    if (!user?.id) return
    
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) {
        setSaveError('Please sign in again')
        setIsSaving(false)
        return
      }

      const payload: Record<string, any> = {
        preferred_roles: roles,
        bio: profileBio,
        marketplace_visible: marketplaceVisible,
        location: location,
      }

      if (credentials.length > 0) {
        payload.credentials = credentials
      }
      if (skills.length > 0) {
        payload.skills = skills
      }

      const res = await fetch('/api/crew/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })
      
      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        const errorData = await res.json()
        setSaveError(errorData.error || 'Failed to save changes')
      }
    } catch (err) {
      setSaveError('Network error - please try again')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Save bio ──────────────────────────────────────────────────────
  async function saveBio() {
    setProfileBio(tempBio)
    setIsEditingBio(false)
    await saveProfile()
  }

  // ── Save location ──────────────────────────────────────────────────
  function selectLocation(locationId: string) {
    setLocation(locationId)
    setLocationSearch('')
    setLocationSuggestions([])
  }

  function clearLocation() {
    setLocation('')
    setLocationSearch('')
  }

  function addCredential() {
    if (!newCred.title || !newCred.institution) return
    setCredentials(prev => [...prev, { ...newCred, id: `cred-${Date.now()}`, isVerified: false }])
    setNewCred({ type: 'certificate', title: '', institution: '', yearObtained: '' })
    setShowCredForm(false)
  }

  function removeCredential(id: string) {
    setCredentials(prev => prev.filter(c => c.id !== id))
  }

  function toggleRole(role: string) {
    const nextRoles = roles.includes(role)
      ? roles.filter(item => item !== role)
      : [...roles, role]
    setRoles(nextRoles)
  }

  function addSkill(name: string) {
    const trimmed = name.trim()
    if (!trimmed || skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) return
    setSkills(prev => [...prev, { id: `skill-${Date.now()}`, name: trimmed, level: 'intermediate', category: 'other' }])
    setSkillInput('')
    setShowSkillInput(false)
  }

  function removeSkill(id: string) {
    setSkills(prev => prev.filter(s => s.id !== id))
  }

  // ── Get smart skill suggestions based on selected roles ──────────
  const getSmartSuggestions = () => {
    const roleSkills = getSuggestedSkillsForRoles(roles)
    const existingSkillNames = new Set(skills.map(s => s.name.toLowerCase()))
    return roleSkills.filter(s => !existingSkillNames.has(s.name.toLowerCase()))
  }

  // Determine which bio to display
  const displayBio = profileBio || EXAMPLE_BIO

  // ── Marketplace visibility requirements ──
  const hasPhoto = !!storedPhotoUrl
  const hasRoles = roles.length > 0
  const hasLocation = !!location
  const isMarketplaceReady = hasPhoto && hasRoles && hasLocation
  const missingItems = []
  if (!hasPhoto) missingItems.push('Profile Photo')
  if (!hasRoles) missingItems.push('Roles')
  if (!hasLocation) missingItems.push('Location')

  // Get selected location details
  const selectedLocation = location ? KENYA_LOCATIONS.find(l => l.id === location) : null

  return (
    <div style={{ 
      background: '#ffffff', 
      minHeight: '100vh', 
      padding: '1rem 1rem 2rem',
      maxWidth: 480,
      margin: '0 auto',
      width: '100%',
    }}>

      {/* ── Header with small thumbnail ────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            overflow: 'hidden',
            background: avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '2px solid var(--border-default)',
          }}
        >
          {storedPhotoUrl ? (
            <Image
              src={storedPhotoUrl}
              alt={displayName}
              width={56}
              height={56}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a2e' }}>{initials}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {displayName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              padding: '0.15rem 0.6rem',
              borderRadius: '999px',
              background: marketplaceVisible ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)',
              color: marketplaceVisible ? 'var(--success)' : 'var(--error)',
              border: `1px solid ${marketplaceVisible ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {marketplaceVisible ? '✓ Visible' : '✕ Hidden'}
            </span>
            <Link
              href="/waiter/me/photos"
              style={{
                fontSize: '0.7rem',
                color: 'var(--amber)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Camera size={13} /> Change photo
            </Link>
          </div>
        </div>
        <Link
          href="/waiter/me/public-profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '0.5rem',
            background: isMarketplaceReady ? 'var(--amber)' : 'var(--background-secondary)',
            border: `1px solid ${isMarketplaceReady ? 'var(--amber)' : 'var(--border-default)'}`,
            textDecoration: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isMarketplaceReady ? 'var(--ink)' : 'var(--text-tertiary)',
            cursor: isMarketplaceReady ? 'pointer' : 'not-allowed',
            opacity: isMarketplaceReady ? 1 : 0.6,
            pointerEvents: isMarketplaceReady ? 'auto' : 'none',
          }}
        >
          <ExternalLink size={14} /> Preview
        </Link>
      </div>

      {/* ── PHOTO REQUIRED WARNING ─────────────────────────────── */}
      {!storedPhotoUrl && (
        <div 
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239,68,68,0.04)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '0.625rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={16} style={{ color: 'var(--error)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--error)' }}>
                Photo required
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Add a profile photo to appear in marketplace
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/waiter/me/photos')}
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--amber)',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              background: 'rgba(200,134,26,0.08)',
              border: '1px solid rgba(200,134,26,0.2)',
            }}
          >
            Add photo →
          </button>
        </div>
      )}

      {/* ── MARKETPLACE VISIBILITY STATUS ────────────────────────── */}
      <div className="card" style={{ 
        padding: '0.875rem 1rem', 
        marginBottom: '1rem',
        border: `2px solid ${isMarketplaceReady ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`,
        background: isMarketplaceReady ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isMarketplaceReady ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)',
            flexShrink: 0,
          }}>
            {isMarketplaceReady ? (
              <Check size={18} style={{ color: 'var(--success)' }} />
            ) : (
              <X size={18} style={{ color: 'var(--error)' }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isMarketplaceReady ? 'var(--success)' : 'var(--error)' }}>
              {isMarketplaceReady ? '✓ Ready for Marketplace' : '✕ Not Ready for Marketplace'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {!hasPhoto && '• Add a profile photo\n'}
              {!hasRoles && '• Select at least one role\n'}
              {!hasLocation && '• Add your primary work location\n'}
              {isMarketplaceReady && 'Venues can find and hire you'}
            </div>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ────────────────────────────────────── */}

      {/* ── BIO SECTION ────────────────────────────────────────────── */}
      <SectionHeading title="About Me" />
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--background-secondary)' }}>
        {isEditingBio ? (
          <div>
            <textarea
              className="input"
              value={tempBio}
              onChange={e => setTempBio(e.target.value)}
              rows={4}
              placeholder="Tell venues about your experience, skills, and availability…"
              style={{ resize: 'none', marginBottom: '0.625rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => {
                setIsEditingBio(false)
                setTempBio(profileBio)
              }}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={saveBio}>
                Save Bio
              </button>
            </div>
          </div>
        ) : (
          <div 
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setTempBio(profileBio)
              setIsEditingBio(true)
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <p style={{ 
                fontSize: '0.85rem', 
                color: profileBio ? 'var(--text-primary)' : 'var(--text-tertiary)', 
                lineHeight: 1.6,
                fontStyle: profileBio ? 'normal' : 'italic',
                margin: 0,
              }}>
                {displayBio}
                {!profileBio && (
                  <span style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--text-tertiary)',
                    display: 'block',
                    marginTop: '0.3rem',
                  }}>
                    👆 Tap to add your own bio
                  </span>
                )}
              </p>
              <Edit3 size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '0.15rem' }} />
            </div>
          </div>
        )}
      </div>

      {/* ── LOCATION SECTION ─────────────────────────────────────────── */}
      <SectionHeading title="Location" />
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--background-secondary)' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Your primary work location {!hasLocation && <span style={{ color: 'var(--error)' }}>• Required</span>}
          </div>
        </div>

        {selectedLocation ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.7rem 0.85rem',
            background: 'var(--amber-pale)',
            border: '1px solid rgba(200,134,26,0.2)',
            borderRadius: '0.625rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: 'var(--amber)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedLocation.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{selectedLocation.county}</div>
              </div>
            </div>
            <button
              onClick={clearLocation}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </div>
        ) : (
          <div>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }} />
              <input
                type="text"
                className="input"
                placeholder="Search for your location..."
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>

            {locationSuggestions.length > 0 && (
              <div style={{
                marginTop: '0.25rem',
                border: '1px solid var(--border-default)',
                borderRadius: '0.5rem',
                maxHeight: '180px',
                overflowY: 'auto',
                background: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}>
                {locationSuggestions.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => selectLocation(loc.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      transition: 'background 0.15s',
                    }}
                  >
                    <MapPin size={14} style={{ color: 'var(--amber)' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{loc.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{loc.county}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
              Search for cities, towns, or neighborhoods across Kenya
            </p>
          </div>
        )}
      </div>

      {/* Roles - with sub-sectioning and columns */}
      <SectionHeading title="Roles & Expertise" />
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--background-secondary)' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            What you can work as — visible to venues {!hasRoles && <span style={{ color: 'var(--error)' }}>• Required</span>}
          </div>
        </div>
        
        {SUGGESTED_ROLES.map(({ category, roles: roleList }) => (
          <div key={category} style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              {category}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
              {roleList.map(role => {
                const checked = roles.includes(role)
                return (
                  <label
                    key={role}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${checked ? 'var(--amber)' : 'var(--border-default)'}`,
                      background: checked ? 'rgba(200,134,26,0.08)' : 'var(--background-primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRole(role)}
                      style={{ 
                        accentColor: 'var(--amber)', 
                        width: 14, 
                        height: 14, 
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                      }}
                    />
                    <span style={{ fontWeight: checked ? 600 : 400, color: 'var(--text-primary)' }}>
                      {role}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Credentials - Optional */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <SectionHeading title="Credentials" />
        <button onClick={() => setShowCredForm(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--amber)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0' }}>
          <Plus size={14} /> Add
        </button>
      </div>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
        Visible on your marketplace profile <span style={{ color: 'var(--text-tertiary)' }}>(optional)</span>
      </p>

      {showCredForm && (
        <div className="card" style={{ marginBottom: '0.75rem', background: 'var(--background-secondary)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label className="input-label">Type</label>
              <select className="input" value={newCred.type}
                onChange={e => setNewCred(p => ({ ...p, type: e.target.value as CredentialType }))}>
                {Object.entries(CREDENTIAL_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Title</label>
              <input type="text" className="input" placeholder="e.g. Diploma in Food & Beverage Service"
                value={newCred.title} onChange={e => setNewCred(p => ({ ...p, title: e.target.value }))} autoFocus />
            </div>
            <div>
              <label className="input-label">Institution</label>
              <input type="text" className="input" placeholder="e.g. Kenya Utalii College"
                value={newCred.institution} onChange={e => setNewCred(p => ({ ...p, institution: e.target.value }))} />
            </div>
            <div>
              <label className="input-label">Year Obtained</label>
              <input type="text" className="input" placeholder="e.g. 2022" maxLength={4} style={{ maxWidth: 120 }}
                value={newCred.yearObtained} onChange={e => setNewCred(p => ({ ...p, yearObtained: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowCredForm(false)}>
                <X size={14} /> Cancel
              </button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={addCredential}
                disabled={!newCred.title || !newCred.institution}>
                <Check size={14} /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {credentials.length === 0 && !showCredForm ? (
        <div className="card" style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'var(--background-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <GraduationCap size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
              Add your diplomas, certificates, or degrees (optional).
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {credentials.map(cred => (
            <div key={cred.id} className="card" style={{ padding: '0.75rem 1rem', background: 'var(--background-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0.1rem 0.5rem', borderRadius: '999px', background: 'var(--amber-pale)', color: 'var(--amber)', border: '1px solid rgba(200,134,26,0.2)' }}>
                      {CREDENTIAL_TYPE_LABELS[cred.type]}
                    </span>
                    {cred.isVerified && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Check size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{cred.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {cred.institution}{cred.yearObtained ? ` · ${cred.yearObtained}` : ''}
                  </div>
                </div>
                <button onClick={() => removeCredential(cred.id)} style={{ width: 24, height: 24, borderRadius: '0.375rem', flexShrink: 0, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Trash2 size={12} style={{ color: 'var(--error)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills - Optional */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <SectionHeading title="Skills" />
        <button onClick={() => setShowSkillInput(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--amber)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0' }}>
          <Plus size={14} /> Add
        </button>
      </div>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
        Visible on your marketplace profile <span style={{ color: 'var(--text-tertiary)' }}>(optional)</span>
      </p>

      {showSkillInput && (
        <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem 1rem', background: 'var(--background-secondary)' }}>
          <label className="input-label">Skill Name</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input type="text" className="input" style={{ flex: 1 }} placeholder="e.g. Wine Service"
              value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addSkill(skillInput) }} autoFocus />
            <button className="btn-primary" style={{ padding: '0.5rem 0.875rem' }} onClick={() => addSkill(skillInput)}>
              <Check size={15} />
            </button>
          </div>
          
          {roles.length > 0 && (
            <>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Recommended for your roles
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
                {getSmartSuggestions().slice(0, 10).map(skill => (
                  <button 
                    key={skill.name} 
                    onClick={() => addSkill(skill.name)} 
                    style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 500, 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '999px', 
                      background: 'rgba(200,134,26,0.08)', 
                      border: '1px solid rgba(200,134,26,0.2)', 
                      color: 'var(--amber)', 
                      cursor: 'pointer' 
                    }}
                  >
                    + {skill.name}
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            General skills
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {GENERAL_SKILLS.filter(s => !skills.some(sk => sk.name === s.name)).slice(0, 8).map(s => (
              <button key={s.name} onClick={() => addSkill(s.name)} style={{ fontSize: '0.7rem', fontWeight: 500, padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'var(--background-primary)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                + {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {skills.length === 0 && !showSkillInput ? (
        <div className="card" style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'var(--background-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
              Add skills like wine service, cocktail mixing, or languages (optional).
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {skills.map(skill => (
            <div key={skill.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.7rem', background: 'var(--background-secondary)', border: '1px solid var(--border-default)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {skill.name}
              <button onClick={() => removeSkill(skill.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={11} style={{ color: 'var(--text-tertiary)' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── SAVE CHANGES BUTTON - At the bottom after all fields ── */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '0.5rem',
        marginTop: '1rem',
        marginBottom: '1rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-default)',
      }}>
        <button
          className="btn-primary"
          onClick={saveProfile}
          disabled={isSaving}
          style={{ 
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          {isSaving ? (
            <>
              <span style={{ 
                width: 16, height: 16, borderRadius: '50%',
                border: '2px solid rgba(26,26,46,0.3)',
                borderTopColor: '#1a1a2e',
                display: 'inline-block',
                animation: 'spin 0.6s linear infinite',
              }} />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
        
        {saveSuccess && (
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            background: 'rgba(16,185,129,0.06)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(16,185,129,0.15)',
          }}>
            <Check size={16} /> All changes saved successfully!
          </div>
        )}
        {saveError && (
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'var(--error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            background: 'rgba(239,68,68,0.06)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(239,68,68,0.15)',
          }}>
            {saveError}
          </div>
        )}
      </div>

      {/* Account */}
      <SectionHeading title="Account" />
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem', background: 'var(--background-secondary)' }}>
        {[
          { icon: Camera,     label: 'Edit Photos & Profile', href: '/waiter/me/photos'  },
          { icon: Bell,       label: 'Notification Settings', href: '/waiter/notifications' },
          { icon: CreditCard, label: 'Payout Settings',       href: '/waiter/me/payout' },
          { icon: Shield,     label: 'Privacy & Marketplace', href: '/waiter/me/privacy'  },
          { icon: LogOut,     label: 'Log Out',              href: '#' },
        ].map(({ icon: Icon, label, href }, i, arr) => {
          if (label === 'Log Out') {
            return (
              <button
                key={label}
                onClick={async () => { await signOut(); router.replace('/auth/login') }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.75rem 1.25rem',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'var(--background-primary)',
                }}
              >
                <Icon size={17} style={{ color: 'var(--error)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--error)' }}>{label}</span>
                <ChevronRight size={15} style={{ color: 'var(--text-tertiary)' }} />
              </button>
            )
          }
          return (
            <Link key={label} href={href} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1.25rem', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none', textDecoration: 'none', background: 'var(--background-primary)' }}>
              <Icon size={17} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{label}</span>
              <ChevronRight size={15} style={{ color: 'var(--text-tertiary)' }} />
            </Link>
          )
        })}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}