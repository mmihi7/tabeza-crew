'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Trash2, Upload, Edit2, Crop } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { getStoredProfilePhotoUrl, setStoredProfilePhotoUrl, getPhotoFrameStyle, usePhotoAspect } from '@/lib/profile-photo'
import { compressImageFile } from '@/lib/compressImage'
import PhotoEditor from '@/components/PhotoEditor'
import type { PhotoCrops } from '@/components/PhotoEditor'

const DEFAULT_CROPS: PhotoCrops = {
  bubble: { x: 0.5, y: 0.5, zoom: 1 },
  card: { x: 0.5, y: 0.5, zoom: 1 },
}

export default function PhotosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [crops, setCrops] = useState<PhotoCrops>(DEFAULT_CROPS)
  const photoAspect = usePhotoAspect(photoUrl)

  useEffect(() => {
    const stored = getStoredProfilePhotoUrl()
    if (stored) setPhotoUrl(stored)

    async function loadProfile() {
      if (!user?.id) { setLoading(false); return }
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) { setLoading(false); return }
      try {
        const res = await fetch('/api/crew/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json()
        if (data.face_photo_url || data.face_thumbnail_url) {
          setPhotoUrl(data.face_photo_url || data.face_thumbnail_url)
          setStoredProfilePhotoUrl(data.face_photo_url || data.face_thumbnail_url)
        }
        if (data.bio) setBio(data.bio)
        // Per-surface framings (bubble / card); fall back to legacy columns.
        if (data.photo_crops) {
          setCrops({
            bubble: {
              x: data.photo_crops.bubble?.x ?? data.photo_crop_x ?? 0.5,
              y: data.photo_crops.bubble?.y ?? data.photo_crop_y ?? 0.5,
              zoom: data.photo_crops.bubble?.zoom ?? data.photo_zoom ?? 1,
            },
            card: {
              x: data.photo_crops.card?.x ?? data.photo_crop_x ?? 0.5,
              y: data.photo_crops.card?.y ?? data.photo_crop_y ?? 0.5,
              zoom: data.photo_crops.card?.zoom ?? data.photo_zoom ?? 1,
            },
          })
        } else if (data.photo_crop_x !== undefined || data.photo_zoom !== undefined) {
          const legacy = {
            x: data.photo_crop_x ?? 0.5,
            y: data.photo_crop_y ?? 0.5,
            zoom: data.photo_zoom ?? 1,
          }
          setCrops({ bubble: { ...legacy }, card: { ...legacy } })
        }
      } catch { /* silent */ }
      setLoading(false)
    }
    loadProfile()
  }, [user?.id])

  const [editingBio, setEditingBio] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    setUploading(true)
    setUploadError(null)

    // Normal photos upload untouched (original bytes, original aspect) —
    // the server rejects payloads over ~4.5MB, so only downscale the big ones.
    // Downscaling uses a single uniform scale factor: the aspect ratio is never
    // changed. Final cropping/positioning is the manual "Adjust" step.
    let uploadFile = file
    if (file.size > 4 * 1024 * 1024) {
      const compressed = await compressImageFile(file)
      if (compressed) {
        uploadFile = new File([compressed.blob], compressed.name, { type: compressed.type })
      } else {
        setUploadError('This photo is too large. Choose a photo under 4MB, or a JPEG/PNG so we can resize it for you.')
        setUploading(false)
        event.target.value = ''
        return
      }
    }

    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('userId', user.id)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) throw new Error('You need to be signed in to upload a photo')

      const response = await fetch('/api/crew/photo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Photo upload failed')

      setPhotoUrl(payload.url)
      setStoredProfilePhotoUrl(payload.url)
      // Reset framings for the new photo
      setCrops(DEFAULT_CROPS)
      // Show editor automatically after upload
      setShowEditor(true)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Photo upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function handleSaveCrop(next: PhotoCrops) {
    if (!user?.id) return
    
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
        body: JSON.stringify({ photo_crops: next }),
      })

      if (res.ok) {
        setCrops(next)
        setShowEditor(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      // Silent fail
    }
  }

  async function handleSaveBio() {
    if (!user?.id) return
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
        body: JSON.stringify({ bio }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        setEditingBio(false)
      }
    } catch {
      // Silent fail
    }
  }

  function handleDelete() {
    setPhotoUrl(null)
    setStoredProfilePhotoUrl(null)
  }

  return (
    <>
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

        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <div className="text-section-heading" style={{ marginBottom: '0.25rem' }}>
            Single profile photo
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
            Upload one photo. You&rsquo;ll position it once for the customer bubble and once for the marketplace card.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt="Profile preview"
                    width={112}
                    height={112}
                    style={{
                      ...getPhotoFrameStyle(crops.bubble, 1, photoAspect),
                    }}
                    priority
                  />
                ) : (
                  <Camera size={28} style={{ color: 'var(--text-tertiary)' }} />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <label style={{ cursor: 'pointer' }}>
                    <span className="btn-primary" style={{ padding: '0.6rem 0.9rem', fontSize: '0.8rem' }}>
                      <Upload size={15} style={{ marginRight: '0.4rem' }} />
                      {uploading ? 'Uploading…' : photoUrl ? 'Replace' : 'Upload'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                  </label>
                  
                  {photoUrl && (
                    <>
                      <button
                        className="btn-ghost"
                        style={{ padding: '0.6rem 0.9rem', fontSize: '0.8rem' }}
                        onClick={() => setShowEditor(true)}
                      >
                        <Edit2 size={15} style={{ marginRight: '0.4rem' }} />
                        Adjust
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ padding: '0.6rem 0.9rem', fontSize: '0.8rem', color: 'var(--error)' }}
                        onClick={handleDelete}
                      >
                        <Trash2 size={15} style={{ marginRight: '0.4rem' }} />
                        Remove
                      </button>
                    </>
                  )}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  Square, portrait, or landscape — it all works. Position and crop with <strong>Adjust</strong> before publishing.
                </span>
                {uploadError && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--error)' }}>{uploadError}</span>
                )}
              </div>
            </div>

            {/* Photo adjustment hint */}
            {photoUrl && (
              <div style={{
                padding: '0.5rem 0.75rem',
                background: 'rgba(255,165,0,0.06)',
                border: '1px solid rgba(255,165,0,0.15)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <Crop size={14} style={{ color: 'var(--amber)' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Use the <strong>Adjust</strong> button to reposition, zoom, and crop your photo for the marketplace
                </span>
              </div>
            )}
          </div>
        </div>

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
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveBio}>
                  Save Bio
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
          onClick={() => {
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
          }}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Photo Editor Modal */}
      {showEditor && photoUrl && (
        <PhotoEditor
          imageUrl={photoUrl}
          initialCrops={crops}
          onSave={handleSaveCrop}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  )
}