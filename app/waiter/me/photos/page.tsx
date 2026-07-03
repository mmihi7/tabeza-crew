'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Trash2, Star, Upload } from 'lucide-react'
import { MOCK_STAFF } from '@/lib/mock-data'
import { FaceBubble } from '@/components/shared/FaceBubble'

interface Photo {
  type: 'face' | 'half_body' | 'full_body'
  url: string | null
  isPrimary?: boolean
}

const PHOTO_CONFIG = {
  face:       { label: 'Face Photo',       hint: 'Square headshot · used in all apps',         required: true,  aspect: '1:1',   dims: '400×400 px' },
  half_body:  { label: 'Half Body Photo',  hint: 'Waist-up shot · shown in marketplace cards', required: false, aspect: '3:4',   dims: '600×800 px' },
  full_body:  { label: 'Full Body Photo',  hint: 'Full-length shot · shown in profile gallery', required: false, aspect: '2:3',   dims: '800×1200 px' },
}

export default function PhotosPage() {
  const router = useRouter()
  const staff = MOCK_STAFF

  const [photos, setPhotos] = useState<Photo[]>([
    { type: 'face',      url: staff.facePhotoUrl ?? null,       isPrimary: true  },
    { type: 'half_body', url: staff.halfBodyPhotoUrl ?? null                     },
    { type: 'full_body', url: staff.fullBodyPhotoUrl ?? null                     },
  ])
  const [bio, setBio] = useState(staff.bio)
  const [saved, setSaved] = useState(false)
  const [editingBio, setEditingBio] = useState(false)

  function handleUpload(type: Photo['type']) {
    // In production: open file picker → upload to Supabase Storage
    alert(`Upload ${type} photo — file picker would open here (UI demo)`)
  }

  function handleDelete(type: Photo['type']) {
    setPhotos(prev => prev.map(p => p.type === type ? { ...p, url: null } : p))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const facePhoto = photos.find(p => p.type === 'face')!

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
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
            Photos & Profile
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            What venues and customers see
          </p>
        </div>
      </div>

      {/* Live preview */}
      <div
        className="card-amber"
        style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}
      >
        <FaceBubble
          displayName={staff.displayName}
          photoUrl={facePhoto.url}
          badgeTier={staff.badgeTier}
          showBadge
          size="lg"
        />
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--amber)', marginBottom: '0.25rem' }}>
            Preview
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {staff.displayName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {facePhoto.url ? 'Face photo uploaded' : 'No face photo — initials shown'}
          </div>
        </div>
      </div>

      {/* Photo sections */}
      {(Object.keys(PHOTO_CONFIG) as Array<keyof typeof PHOTO_CONFIG>).map(type => {
        const config = PHOTO_CONFIG[type]
        const photo  = photos.find(p => p.type === type)!

        return (
          <div key={type} style={{ marginBottom: '1.5rem' }}>
            {/* Section heading */}
            <div style={{ marginBottom: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="text-section-heading">{config.label}</div>
                {config.required && (
                  <span
                    style={{
                      fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                      background: 'rgba(239,68,68,0.12)', color: 'var(--error)',
                      padding: '0.1rem 0.4rem', borderRadius: '999px',
                    }}
                  >
                    Required
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {config.hint} · {config.dims}
              </p>
            </div>

            {photo.url ? (
              /* Uploaded state */
              <div className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  {/* Placeholder thumbnail */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: type === 'face' ? 64 : 52,
                      height: type === 'face' ? 64 : type === 'half_body' ? 69 : 78,
                      borderRadius: type === 'face' ? '50%' : '0.5rem',
                      background: 'var(--amber-pale)',
                      border: `2px solid ${type === 'face' ? 'var(--amber)' : 'var(--border-default)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Camera size={20} style={{ color: 'var(--amber)' }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    {type === 'face' && photo.isPrimary && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                        <Star size={12} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--amber)' }}>
                          Primary
                        </span>
                      </div>
                    )}
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      Photo uploaded
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      {config.dims}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-ghost"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => handleUpload(type)}
                    >
                      Replace
                    </button>
                    <button
                      onClick={() => handleDelete(type)}
                      style={{
                        width: 34, height: 34, borderRadius: '0.5rem',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={15} style={{ color: 'var(--error)' }} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state — upload prompt */
              <button
                onClick={() => handleUpload(type)}
                style={{
                  width: '100%', padding: '1.25rem',
                  background: 'var(--background-secondary)',
                  border: `2px dashed ${config.required ? 'rgba(245,158,11,0.4)' : 'var(--border-default)'}`,
                  borderRadius: '0.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                <Upload size={24} style={{ color: 'var(--text-tertiary)' }} />
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Upload {config.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  {config.dims} · {config.aspect}
                </div>
              </button>
            )}
          </div>
        )
      })}

      <hr className="divider" />

      {/* Bio */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="text-section-heading" style={{ marginBottom: '0.25rem' }}>
          About Me
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Shown on your public marketplace profile.
        </p>

        {editingBio ? (
          <div>
            <textarea
              className="input"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              placeholder="Tell venues about your experience, skills, and availability…"
              style={{ resize: 'none', marginBottom: '0.625rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setEditingBio(false)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setEditingBio(false)}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <div
            className="card"
            style={{ padding: '1rem', cursor: 'pointer', position: 'relative' }}
            onClick={() => setEditingBio(true)}
          >
            <p style={{ fontSize: '0.875rem', color: bio ? 'var(--text-primary)' : 'var(--text-tertiary)', lineHeight: 1.6 }}>
              {bio || 'Tap to add a bio…'}
            </p>
            <div style={{ fontSize: '0.7rem', color: 'var(--amber)', marginTop: '0.5rem', fontWeight: 500 }}>
              Tap to edit
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <button
        className="btn-primary"
        style={{ width: '100%' }}
        onClick={handleSave}
      >
        {saved ? '✓ Saved!' : 'Save Changes'}
      </button>
    </div>
  )
}
