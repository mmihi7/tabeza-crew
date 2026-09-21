'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Trash2, Upload, Edit2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { getStoredProfilePhotoUrl, setStoredProfilePhotoUrl, getPhotoFrameStyle, usePhotoAspect, regionFromCrops, FULL_REGION } from '@/lib/profile-photo'
import { compressImageFile } from '@/lib/compressImage'
import PhotoEditor from '@/components/PhotoEditor'
import type { PhotoCrops } from '@/components/PhotoEditor'

const DEFAULT_CROPS: PhotoCrops = {
  bubble: FULL_REGION,
  card: FULL_REGION,
}

export default function PhotosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editorMode, setEditorMode] = useState<'bubble' | 'card'>('bubble')
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
        // Per-surface visible regions (bubble / card); legacy shapes fall back
        // to the whole photo.
        setCrops({
          bubble: regionFromCrops(data.photo_crops, 'bubble'),
          card: regionFromCrops(data.photo_crops, 'card'),
        })
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
      setEditorMode('bubble')
      setShowEditor(true)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Photo upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function handleSaveCrop(next: PhotoCrops): Promise<boolean> {
    if (!user?.id) return false

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) return false

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
        return true
      }
      return false
    } catch {
      return false
    }
  }

  function openEditor(m: 'bubble' | 'card') {
    setEditorMode(m)
    setShowEditor(true)
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
            Public views
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
            Upload one photo. You position it separately for the customer bubble and the venue marketplace card.
          </p>

          {/* Two columns: Profile (bubble) | Marketplace (card) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.875rem' }}>
            {/* Profile */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Profile
              </div>
              <div style={{
                width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
                background: 'var(--background-secondary)', border: '1px solid var(--border-default)',
                margin: '0 auto', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {photoUrl ? (
                  <div style={{
                    ...getPhotoFrameStyle(crops.bubble, 1, photoAspect),
                    background: `url("${photoUrl}") center / cover no-repeat`,
                  }} />
                ) : (
                  <Camera size={24} style={{ color: 'var(--text-tertiary)' }} />
                )}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                Customers see this
              </div>
              {photoUrl && (
                <button
                  className="btn-ghost"
                  style={{ marginTop: '0.5rem', fontSize: '0.72rem', padding: '0.35rem 0.7rem' }}
                  onClick={() => openEditor('bubble')}
                >
                  <Edit2 size={13} style={{ marginRight: '0.3rem' }} />
                  Edit
                </button>
              )}
            </div>

            {/* Marketplace */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Marketplace
              </div>
              <div style={{
                width: 96, aspectRatio: '3 / 4', borderRadius: '0.6rem', overflow: 'hidden',
                background: 'var(--background-secondary)', border: '1px solid var(--border-default)',
                margin: '0 auto', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {photoUrl ? (
                  <div style={{
                    ...getPhotoFrameStyle(crops.card, 3 / 4, photoAspect),
                    background: `url("${photoUrl}") center / cover no-repeat`,
                  }} />
                ) : (
                  <Camera size={24} style={{ color: 'var(--text-tertiary)' }} />
                )}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                Venues see this
              </div>
              {photoUrl && (
                <button
                  className="btn-ghost"
                  style={{ marginTop: '0.5rem', fontSize: '0.72rem', padding: '0.35rem 0.7rem' }}
                  onClick={() => openEditor('card')}
                >
                  <Edit2 size={13} style={{ marginRight: '0.3rem' }} />
                  Edit
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <label style={{ cursor: 'pointer' }}>
              <span className="btn-primary" style={{ padding: '0.6rem 0.9rem', fontSize: '0.8rem' }}>
                <Upload size={15} style={{ marginRight: '0.4rem' }} />
                {uploading ? 'Uploading…' : photoUrl ? 'Replace photo' : 'Upload photo'}
              </span>
              <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
            </label>
            {photoUrl && (
              <button
                className="btn-ghost"
                style={{ padding: '0.6rem 0.9rem', fontSize: '0.8rem', color: 'var(--error)' }}
                onClick={handleDelete}
              >
                <Trash2 size={15} style={{ marginRight: '0.4rem' }} />
                Remove
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', textAlign: 'center' }}>
            Square, portrait, or landscape — it all works. Position each view with <strong>Edit</strong>.
          </div>
          {uploadError && (
            <div style={{ fontSize: '0.72rem', color: 'var(--error)', marginTop: '0.4rem', textAlign: 'center' }}>{uploadError}</div>
          )}
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
          initialMode={editorMode}
          onSave={handleSaveCrop}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  )
}